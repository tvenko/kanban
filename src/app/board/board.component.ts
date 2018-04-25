import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Column } from '../shared/models/column.interface';
import { BoardsService } from '../shared/services/boards.service';
import { Board } from '../shared/models/board.interface';
import { Project } from '../shared/models/project.interface';
import { ProjectsService } from '../shared/services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../shared/services/message.service';
import { BoardsListService } from '../shared/services/boards-list.service';
import {Router} from '@angular/router';
import {User} from '../shared/models/user.interface';
import {UsersService} from '../shared/services/users.service';
import { CardsComponent } from './cards/cards.component';

declare var UIkit: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})

export class BoardComponent implements OnInit, OnDestroy {
  @ViewChild(CardsComponent)
     private cardsComponent: CardsComponent;

  id: number;
  private sub: any;
  colors = ['#FFB300', '#FF3D00', '#29B6F6', '#8BC34A', '#ffd633', '#884EA0'];
  cardColors = ['#cc3300', '#ffcc00', '#33cc33'];
  board: Board;
  dataTransfer = new Map();
  newColumnForm: FormGroup;
  error: string;
  newColumnOffset: number = null;
  newSubcolumnParent: number = null;
  delColumn: Column = null;
  editBoard = false;
  users = new Map();

  currentUserId = null;
  projects: Project[] = [];
  addProjectForm: FormGroup;
  addedProject: Project;

  leftColumnId: number = null;
  rightColumnId: number = null;

  constructor(private boardsService: BoardsService,
              private boardsListService: BoardsListService,
              private router: Router,
              private projectsService: ProjectsService,
              private route: ActivatedRoute,
              private messageService: MessageService,
              private userService: UsersService) {
    this.messageService.listen().subscribe((msg: any) => {
      if (msg === 'editBoard') {
        this.editBoard = !this.editBoard;
      }
      if (msg === 'addProject') {
        UIkit.modal('#add-project-modal').show();
      }
    });
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user'));
    this.currentUserId = user['id'];
    this.sub = this.route.params.subscribe(params => {
       this.id = +params['id'];

       // Check if the user is allowed to see this board.
       this.boardsListService.getBoards(this.currentUserId).subscribe(boards => {
          let isAllowed = false;
          Object.values(boards).forEach((x) => {
            if (x[1] === this.id) { // x[1] is board id
              isAllowed = true;
            }
          });
          if (!isAllowed) {
            this.router.navigate(['/boards-list']);
            return;
          }

          this.getBoard();
          this.loadProjects();

        }, err => {
          console.log('error geting boards from backend');
        });
    });

    this.newColumnForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      wip: new FormControl(null, Validators.required),
      leftColumn: new FormControl(null),
      rightColumn: new FormControl(null),
      highPriority: new FormControl(null),
      testColumn: new FormControl(null)
    });

    this.addProjectForm = new FormGroup({
      project: new FormControl(null, Validators.required),
    });
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe(users => {
      for (const user of <User[]>users) {
        this.users.set(user.id, user);
      }
    }, err => console.log('uporabnikov ni bilo mogce dobiti'));
  }

  getUserName(id: number) {
    const user = <User>this.users.get(id);
    return user.name + ' ' + user.surname;
  }

  getBoard() {
    this.boardsService.getBoard(this.id).subscribe(board => {
      console.log(board[0]);
      this.board = <Board>board[0];
      this.leftColumnId = this.board.type_left_border_column_id;
      this.rightColumnId = this.board.type_right_border_column_id;
    }, err => {
      // Board doesn't exist. Redirect the user?
      console.log('Ni bilo mogoce dobiti table ' + err);
    });
  }

  addColumn(i: number, parentId: number) {
    console.log('CHECK');
    this.newColumnOffset = i;
    this.newSubcolumnParent = parentId;
  }

  loadProjects() {
    this.projectsService.getProjects().subscribe(projects => {
      this.projects = [];
      for (const project of <Project[]>projects) {
        if (project.board_id === null) {
          this.projects.push(project);
        }
      }
      console.log(this.projects);
    }, err => {
      console.log('error geting projects from backend');
    });

  }

  addProject() {
    this.addedProject = this.addProjectForm.get('project').value;
    this.addedProject.board_id = this.board.id;
    let differentGroup = false;
    for (const projectonBoard of this.board.projects) {
      if (projectonBoard.developer_group_id !== this.addedProject.developer_group_id) {
        differentGroup = true;
      }
    }
    if (differentGroup) {
      UIkit.modal('#add-project-modal').hide();
      UIkit.modal('#different-groups-modal').show();
    } else {
      this.postAddedProject();
    }
  }

  postAddedProject() {
    this.projectsService.updateProject(this.addedProject).subscribe(
      res => {
        this.getBoard();
        this.loadProjects();
        this.closeProjectModal();
      },
      err => console.log('napaka pri dodajanju projekta na tablo'));
  }

  closeProjectModal() {
    this.addProjectForm.reset();
    UIkit.modal('#add-project-modal').hide();
    UIkit.modal('#different-groups-modal').hide();
  }

  removeProject(project: Project) {
    project.board_id = null;
    this.projectsService.updateProject(project).subscribe(
      res => {
        this.getBoard();
        this.loadProjects();
        this.addProjectForm.reset();
      },
      err => console.log('napaka pri brisanju projekta z table'));
  }

  postColumn() {
    const newColumn: Column = {
      id: null,
      title: this.newColumnForm.get('name').value,
      wip_restriction: this.newColumnForm.get('wip').value,
      parent_column_id: this.newSubcolumnParent,
      display_offset: this.newColumnOffset,
      board_id: this.board.id,
      subcolumns: null,
      column_cards: null
    };
    this.boardsService.postColumn(newColumn).subscribe(column => {
      UIkit.notification(
        'Stolpec ' + newColumn.title + ' je dodan na tablo.',
        {status: 'success', timeout: 2000}
      );
      this.setSpecialColumns(<Column>column);
      this.getBoard();
    }, err => {
      this.error = 'ti šment nekaj se je moralo zalomiti, stolpca ni mogoče dodani na tablo.';
      console.log('stolpca ni bilo mogoce dodati na tablo.');
    });
  }

  setDeleteColumn(column: Column) {
    this.delColumn = column;
  }

  getColumnById(columnId: number) {
    for (const column of this.board.columns) {
      for (const subcolumn of column.subcolumns) {
        if (subcolumn.id === columnId) {
          return subcolumn;
        }
      }
      if (column.id === columnId) {
        return column;
      }
    }
    return null;
  }

  deleteColumn() {
    if (this.delColumn !== null) {
      const specialText = this.showSpecialColumn(this.delColumn.id);
      if (specialText === null) {
        this.boardsService.deleteColumn(this.delColumn.id).subscribe(res => {
          UIkit.notification(
            'Stolpec ' + this.delColumn.title + ' je izbrisan.',
            {status: 'success', timeout: 2000}
          );
          this.getBoard();
          this.delColumn = null;
          this.error = null;
          UIkit.modal('#delete-column-modal').hide();
        }, err => {
          console.log(err);
          UIkit.notification(
            'Stolpca ' + this.delColumn.title + ' ni bilo mogoče izbrisati.',
            {status: 'warn', timeout: 2000}
          );
          this.delColumn = null;
          this.error = null;
          UIkit.modal('#delete-column-modal').hide();
        });
      } else {
        this.error = 'Stolpec ima vloge: ' + specialText + '. Preden lahko zbrišete stolpec morate te vloge dodeliti drugemu stolpcu.';
      }
    }
  }

  closeModal() {
    this.newSubcolumnParent = null;
    this.newColumnOffset = null;
    this.error = null;
    UIkit.modal('#new-column-modal').hide();
    this.newColumnForm.reset();
  }

  closeDeleteModal() {
    this.error = null;
  }

  onDragStart(event, card, column) {
    this.dataTransfer.set('card', card);
    this.dataTransfer.set('column', column);
  }

  onDrop(event, data, column) {
    const card = this.dataTransfer.get('card');
    const prevColumn = this.dataTransfer.get('column');
    this.dataTransfer.clear();
    column.cards.push(card);
    const index = prevColumn.cards.indexOf(card);
    if (index > 0) {
      if (prevColumn.cards.length > 1) {
        prevColumn.cards.splice(card, 1);
      } else {
        prevColumn.cards = null;
      }
    }
    console.log(this.dataTransfer);
    event.preventDefault();
  }

  allowDrop(event) {
    event.preventDefault();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  setSpecialColumns(column: Column) {
    if (this.newColumnForm.get('leftColumn').value) {
      this.board.type_left_border_column_id = column.id;
    }
    if (this.newColumnForm.get('rightColumn').value) {
      this.board.type_right_border_column_id = column.id;
    }
    if (this.newColumnForm.get('highPriority').value) {
      this.board.type_priority_column_id = column.id;
    }
    if (this.newColumnForm.get('testColumn').value) {
      this.board.type_acceptance_testing_column_id = column.id;
    }
    this.boardsService.updateBoard(this.board).subscribe(res => {
      console.log('uspesno posodobljeni stolpci');
      this.closeModal();
    }, err => {
      console.log(err);
      this.closeModal();
    });
  }

  showSpecialColumn(columnId: number) {
    let display = '';
    if (this.board.type_left_border_column_id === columnId) {
      display += 'levi mejni stolpec, ';
    }
    if (this.board.type_right_border_column_id === columnId) {
      display += 'desni mejni stolpec, ';
    }
    if (this.board.type_priority_column_id === columnId) {
      display += 'stolpec z prioriteto, ';
    }
    if (this.board.type_acceptance_testing_column_id === columnId) {
      display += 'testni stolpec, ';
    }
    if (display !== '') {
      return display.substring(0, display.length - 2);
    }
    return null;
  }

  setLeftColumn(columnId: number) {
    this.board.type_left_border_column_id = columnId;
    this.boardsService.updateBoard(this.board).subscribe(res => this.getBoard());
  }

  setRightColumn(columnId: number) {
    this.board.type_right_border_column_id = columnId;
    this.boardsService.updateBoard(this.board).subscribe(res => this.getBoard());
  }

  setTestColumn(columnId: number) {
    this.board.type_acceptance_testing_column_id = columnId;
    this.boardsService.updateBoard(this.board).subscribe(res => this.getBoard());
  }

  setPriorityColumn(columnId: number) {
    this.board.type_priority_column_id = columnId;
    this.boardsService.updateBoard(this.board).subscribe(res => this.getBoard());
  }

  displayAddLeftColumnValidation(column: Column) {
    if (this.rightColumnId === null) {
      return true;
    }
    const righColumn = this.getColumnById(this.rightColumnId);
    if (righColumn !== null) {
      if (this.getColumnById(this.rightColumnId).parent_column_id === null && column.parent_column_id === null) {
        return this.getColumnById(this.rightColumnId).display_offset >= column.display_offset;
      } else if (righColumn.parent_column_id === null && column.parent_column_id !== null) {
        return righColumn.display_offset >= this.getColumnById(column.parent_column_id).display_offset;
      } else if (righColumn.parent_column_id !== null && column.parent_column_id === null) {
        return this.getColumnById(righColumn.parent_column_id).display_offset >= column.display_offset;
      } else {
        if (righColumn.parent_column_id === column.parent_column_id) {
          return righColumn.display_offset >= column.display_offset;
        } else {
          return this.getColumnById(righColumn.parent_column_id).display_offset >= this.getColumnById(column.parent_column_id).display_offset;
        }
      }
    }
    return false;
  }

  displayAddRightColumnValidation(column: Column) {
    if (this.leftColumnId === null) {
      return true;
    }
    const leftColumn = this.getColumnById(this.leftColumnId);
    if (leftColumn !== null) {
      if (leftColumn.parent_column_id === null && column.parent_column_id === null) {
        return leftColumn.display_offset <= column.display_offset;
      } else if (leftColumn.parent_column_id === null && column.parent_column_id !== null) {
        return leftColumn.display_offset <= this.getColumnById(column.parent_column_id).display_offset;
      } else if (leftColumn.parent_column_id !== null && column.parent_column_id === null) {
        return this.getColumnById(leftColumn.parent_column_id).display_offset <= column.display_offset;
      } else {
        if (leftColumn.parent_column_id === column.parent_column_id) {
          return leftColumn.display_offset <= column.display_offset;
        } else {
          return this.getColumnById(leftColumn.parent_column_id).display_offset <= this.getColumnById(column.parent_column_id).display_offset;
        }
      }
    }
    return false;
  }

  getColumnWip(column: Column) {
    let wip = 0;
    for (const subcolumn of column.subcolumns) {
      wip += subcolumn.column_cards.length;
    }
    return wip;
  }

}
