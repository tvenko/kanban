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
import {Card} from '../shared/models/card.interface';
import {CardsService} from '../shared/services/cards.service';
import { CardsComponent } from './cards/cards.component';

declare var UIkit: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})

export class BoardComponent implements OnInit, OnDestroy {

  @ViewChild(CardsComponent)
  cardsComponent: CardsComponent;

  id: number;
  private sub: any;
  private msgServiceSub: any;
  colors = ['#FFB300', '#FF3D00', '#29B6F6', '#8BC34A', '#ffd633', '#884EA0'];
  cardColors = ['#cc3300', '#ffcc00', '#33cc33'];
  board: Board;
  dataTransfer = new Map();
  newColumnForm: FormGroup;
  changeWipForm: FormGroup;
  editCardDisplayForm: FormGroup;

  error: string;
  newColumnOffset: number = null;
  newSubcolumnParent: number = null;
  delColumn: Column = null;
  editBoard = false;
  users = new Map();
  currentUser: User;
  currentUserGroups: number[];
  hiddenColumns = [];

  showCardDescription:true;
  showCardPriority: true;
  showCardDificulty: true;
  showCardDeadlien: true;

  showCriticalCards = false;
  criticalDays = 0;

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
              private userService: UsersService,
              private cardService: CardsService) {
    this.msgServiceSub = this.messageService.listen().subscribe((msg: any) => {
      if (msg === 'editBoard') {
        this.editBoard = !this.editBoard;
      }
      if (msg === 'addProject') {
        this.addProjectForm.reset();
        this.loadProjects();
        UIkit.modal('#add-project-modal').show();
      }
      if (msg === 'copyBoard') {
        this.copyBoard();
      }
      if (msg === 'showCritical') {
        this.showCritical();
      }
      if (msg === 'editCardDisplay'){
        this.editCardDisplay();
      }
    });
  }

  ngOnInit() {
    this.showCardDescription =true;
    this.showCardPriority= true;
    this.showCardDificulty= true;
    this.showCardDeadlien= true;
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    this.currentUserId = this.currentUser['id'];
    this.sub = this.route.params.subscribe(params => {
       this.id = +params['id'];

       // Check if the user is allowed to see this board.
       this.boardsListService.getBoards(this.currentUserId).subscribe(boards => {
         console.log(boards);
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

    this.changeWipForm = new FormGroup({
      wip: new FormControl(null, Validators.required),
    });

    this.editCardDisplayForm = new FormGroup({
      card_description: new FormControl(null),
      card_priority: new FormControl(null),
      card_dificulty: new FormControl(null),
      card_deadline: new FormControl(null)
    });

    this.getUsers();
    this.getUserGroups();
  }

  getUsers() {
    this.userService.getUsers().subscribe(users => {
      for (const user of <User[]>users) {
        this.users.set(user.id, user);
      }
    }, err => console.log('uporabnikov ni bilo mogce dobiti'));
  }

  getUserName(id: number) {
    if (id !== null) {
      const user = <User>this.users.get(id);
      if (user !== null) {
        return user.name + ' ' + user.surname;
      }
    }
    return '';
  }

  getUserGroups() {
    this.userService.getUserGroups(this.currentUserId).subscribe(groups => {
      this.currentUserGroups = <number[]>groups;
    });
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
    for (const column of this.board.columns) {
      for (const subcolumn of column.subcolumns) {
        for (const card of subcolumn.column_cards) {
          if (card.project_id === project.id) {
            this.cardService.deleteCard(card.card_id).subscribe();
          }
        }
      }
      for (const card of column.column_cards) {
        if (card.project_id === project.id) {
          this.cardService.deleteCard(card.card_id).subscribe();
        }
      }
    }
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
      column_cards: null,
      subcolumns_length: null
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

  onDragStart(event, card: Card, column: Column, project: Project) {
    this.dataTransfer.set('card', card);
    this.dataTransfer.set('column', column);
    this.dataTransfer.set('project', project);
  }

  onDrop(event, column: Column, project: Project) {
    const card: Card = this.dataTransfer.get('card');
    const prevColumn: Column = this.dataTransfer.get('column');
    const prevProject: Project = this.dataTransfer.get('project');
    this.dataTransfer.clear();
    if (this.allowedMove(prevProject, project, prevColumn, column)) {
      if (column.column_cards.length >= column.wip_restriction && column.wip_restriction > 0) {
        alert('S prestavljanjem kartice ste kršili WIP omejitev');
        const violation = {
          card_id: card.card_id,
          column_id: column.id,
          user_id: this.currentUserId,
          wip_violation_reason_id: 3
        };
        this.boardsService.postWipViolation(violation).subscribe();
      }
      const index = prevColumn.column_cards.indexOf(card);
      if (prevColumn.column_cards.length > 0) {
        prevColumn.column_cards.splice(index, 1);
      } else {
        prevColumn.column_cards = [];
      }
      column.column_cards.push(card);
      card.column_id = column.id;
      if (this.board.type_left_border_column_id === column.id && card.started_at === null) {
        console.log(new Date().toISOString());
        card.started_at = new Date().toISOString();
      } else if (this.board.type_right_border_column_id === column.id) {
        card.completed_at = new Date().toISOString();
      }
      this.cardService.updateCard(card).subscribe(res => {
        this.getBoard();
      }, err => console.log(err));

      const cardLog = {
        card_id: card.card_id,
        from_column_id: prevColumn.id,
        to_column_id: column.id
      };
      this.cardService.postCardLog(cardLog).subscribe();
    }
    event.preventDefault();
  }

  allowDrop(event) {
    event.preventDefault();
  }

  allowedMove(prevProject: Project, project: Project, prevColumn: Column, column: Column) {
    if (prevProject.id === project.id && this.currentUserGroups.indexOf(+prevProject.developer_group_id) >= 0) {
      // ce premika iz testnega stolpca lahko dela samo produkt owner, samo v stolpec z najvisjo prioriteto ali levo od njega.
      if (prevColumn.id === this.board.type_acceptance_testing_column_id) {
        if (this.currentUser.roles.indexOf('product owner') >= 0) {
          return this.boardsService.enumeratedColumns.get(column.id) <= this.boardsService.enumeratedColumns.get(this.board.type_priority_column_id) ||
            this.boardsService.enumeratedColumns.get(column.id) - this.boardsService.enumeratedColumns.get(prevColumn.id) === 1;
        } else {
          return this.boardsService.enumeratedColumns.get(column.id) - this.boardsService.enumeratedColumns.get(prevColumn.id) === 1;
        }
      }
      return Math.abs(this.boardsService.enumeratedColumns.get(column.id) - this.boardsService.enumeratedColumns.get(prevColumn.id)) === 1;
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.msgServiceSub.unsubscribe();
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
    return this.boardsService.enumeratedColumns.get(column.id) < this.boardsService.enumeratedColumns.get(this.rightColumnId);
  }

  displayAddRightColumnValidation(column: Column) {
    if (this.leftColumnId === null) {
      return true;
    }
    return this.boardsService.enumeratedColumns.get(column.id) > this.boardsService.enumeratedColumns.get(this.leftColumnId);
  }

  getColumnWip(column: Column) {
    let wip = 0;
    if (column.subcolumns != null && column.subcolumns.length > 0) {
      for (const subcolumn of column.subcolumns) {
        for (const card of subcolumn.column_cards) {
          if (card.active) {
            wip++;
          }
        }
      }
    } else {
      for (const card of column.column_cards) {
        if (card.active) {
          wip++;
        }
      }
    }
    return wip;
  }

  copyBoard() {
    const confirmCopy = confirm('Kopiram tablo?');
    if (confirmCopy) {
      this.boardsListService.copyBoard(this.id).subscribe(msg => {
        UIkit.notification('Tabla uspešno kopirana.', {status: 'warning', timeout: 2000});
      }, err => {
        console.log('error copying the board');
        UIkit.notification('Tabla ni kopirana. Vzrok: Težave s strežnikom.', {status: 'danger', timeout: 2000});
      });
    }
  }
  showCritical() {

    const self = this;
    UIkit.modal.prompt('Ševilo preostalih dni:', null).then( (n) => {

      if (n != null) {
        if (isNaN(n)) {
          UIkit.notification('Vnesi število.', {status: 'danger', timeout: 2000});
        } else {
          self.showCriticalCards = true;
          self.criticalDays = n;
        }

      }
    });
  }

  editCardDisplay(){
    this.editCardDisplayForm.reset();
    this.editCardDisplayForm.setValue({
      card_description: this.showCardDescription, 
      card_priority: this.showCardPriority,
      card_dificulty: this.showCardDificulty,
      card_deadline: this.showCardDeadlien
    });
    UIkit.modal('#edit-card-display-modal').show();


  }

  finishEditCardDisplay(){
    this.showCardDescription = this.editCardDisplayForm.get('card_description').value;
    this.showCardPriority = this.editCardDisplayForm.get('card_priority').value;
    this.showCardDificulty = this.editCardDisplayForm.get('card_dificulty').value;
    this.showCardDeadlien = this.editCardDisplayForm.get('card_deadline').value;
    UIkit.modal('#edit-card-display-modal').hide();
    UIkit.notification('Prikaz prilagojen.', {status: 'success', timeout: 2000}
    );
    
  }

  getDiferenceInDays(theDate): number {

    if (theDate != null) {
      theDate = new Date(theDate);
      return (theDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) ;

    } else {
      return -99999999;
    }
  }
  hideColumn(id: number) {
    this.hiddenColumns.push(id);
  }

  showColumn(id: number) {
    const index = this.hiddenColumns.indexOf(id);
    if (index >= 0) {
      console.log('INDEX: ', index);
      this.hiddenColumns.splice(index, 1);
    }
  }

  isHiddenColumn(id: number) {
    if (this.hiddenColumns.indexOf(id) >= 0) {
      return true;
    }
    return false;
  }

  adjustHiddenColumn() {
    const val = -(this.board.projects.length - 1) * 87;
    return String(val) + 'vh';
  }

  changeWip(column: Column) {
    const wip = this.changeWipForm.get('wip').value;
    if (column.column_cards.length <= wip || wip === 0) {
      column.wip_restriction = wip;
      this.boardsService.updateBoard(this.board).subscribe();
    } else {
      const confirmWip = confirm('Če spremenite WIP omejitev biste kršili wip omejitev. Ste prepričani, da želite spremeniti WIP omejitev?');
      if (confirmWip) {
        column.wip_restriction = wip;
        this.boardsService.updateBoard(this.board).subscribe();
        for (const card of column.column_cards) {
          const violation = {
            card_id: card.card_id,
            column_id: column.id,
            user_id: this.currentUserId,
            wip_violation_reason_id: 4
          };
          this.boardsService.postWipViolation(violation).subscribe();
        }
      }
    }
  }

  refreshBoard(){
    this.getBoard();
    this.loadProjects();
  }
}
