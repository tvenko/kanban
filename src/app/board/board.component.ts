import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Column } from '../shared/models/column.interface';
import { BoardsService } from '../shared/services/boards.service';
import { Board } from '../shared/models/board.interface';
import { Project } from '../shared/models/project.interface';
import { ProjectsService } from '../shared/services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../shared/services/message.service';

declare var UIkit: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, OnDestroy {
  id: number;
  private sub: any;
  colors = ['#FFB300', '#FF3D00', '#29B6F6', '#8BC34A', '#ffd633', '#884EA0'];
  board: Board;
  dataTransfer = new Map();
  newColumnForm: FormGroup;
  error: string;
  newColumnOffset: number = null;
  newSubcolumnParent: number = null;
  delColumn: Column = null;
  editBoard = false;

  currentUserId = null;
  projects: Project[];
  projectsOnBoard: Project[] = [];
  addProjectForm: FormGroup;

  constructor(private boardsService: BoardsService,
              private projectsService: ProjectsService,
              private route: ActivatedRoute,
              private messageService: MessageService) {
    this.messageService.listen().subscribe((msg: any) => {
      console.log('MESSAGE: ', msg);
      if (msg === 'editBoard') {
        this.editBoard = !this.editBoard;
      }
      if (msg === 'addProject') {
        UIkit.modal('#add-project-modal').show();
      }
    });
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.id = +params['id']; // (+) converts string 'id' to a number

       // TODO: Check if the user is allowed to see this board.

       this.getBoard();
       this.loadProjects();
    });
    const user = JSON.parse(localStorage.getItem('user'));
    this.currentUserId = user['id'];

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

  }

  getBoard() {
    this.boardsService.getBoard(this.id).subscribe(board => {
      console.log(board[0]);
      this.board = <Board>board[0];
    }, err => {
      // Board doesn't exist. Redirect the user?
      console.log('Ni bilo mogoce dobiti table ' + err);
    });
  }

  addColumn(i: number, parentId: number) {
    this.newColumnOffset = i;
    this.newSubcolumnParent = parentId;
  }

  addProjectModal() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectsService.getProjects().subscribe(projects => {

     // if (!this.isCurrentUserAdmin) {
        /*projects = Object.values(projects).filter((project, index, array) => {
          let isMember = false;
          <Project>project.group_data.users.forEach( (user) => {
            if (user["id"] == this.currentUserId) {
              isMember = true;
            }
          });
          return isMember;
        });*/
     // }
      this.projects = <Project[]> projects;
      this.projects.sort(function (a, b) {
        return a.id - b.id;

      });
      console.log(this.projects);
    }, err => {
      console.log('error geting projects from backend');
    });

  }

  cancelAddProject() {

  }
  addProject() {
    const project = this.addProjectForm.get('project').value;
    this.projectsOnBoard.push(project);
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
    for (const el of this.board.columns) {
      if (el.id === columnId) {
        return el;
      }
    }
    return null;
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
}
