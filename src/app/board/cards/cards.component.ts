import { Component, OnInit, group, Output, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Project } from '../../shared/models/project.interface';
import { ProjectsService } from '../../shared/services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { BoardsService } from '../../shared/services/boards.service';
import { Board } from '../../shared/models/board.interface';
import { User } from '../../shared/models/user.interface';
import { GroupMember, Group } from '../../shared/models/group.interface';
import { Card } from '../../shared/models/card.interface';
import { Priority } from '../../shared/models/priority.interface';
import { PriorityService } from '../../shared/services/priority.service';
import { CardsService } from '../../shared/services/cards.service';
import { BoardsListService } from '../../shared/services/boards-list.service';
import {Router} from '@angular/router';
import { CardDetailed } from '../../shared/models/cardDetailed.interface';
import { WipViolation } from '../../shared/models/wipViolation.interface';
import { Log } from '../../shared/models/log.interface';
import { BoardComponent } from '../board.component';
import { Task } from '../../shared/models/task.interface';
import {UsersService} from "../../shared/services/users.service";
import { DeleteReasonsService } from '../../shared/services/deleteReasons.service';
import { DeleteReason } from '../../shared/models/deleteReason.interface';
declare var UIkit: any;


@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {
  cardType: string;
  tasks: Task[];
  private sub: any;
  selectedCard: Card;
  error: string = null;

  cardsModalTitle: String;
  newCardForm: FormGroup;
  editCardForm: FormGroup;
  deleteCardForm: FormGroup;
  projects: Project[] = [];
  board: Board;
  priorities: Priority[];
  deleteReasons: DeleteReason[];
  silverBullet = false;

  isCurrentUserAdmin: boolean;
  isCurrentUserKanbanMaster: boolean;
  isCurrentUserProductOwner: boolean;
  isCurrentUserDeveloper: boolean;
  currentUserId: number;
  currectBoardId: number;
  currentUserProjects: Project[] = [];
  today: Date;
  sl: any;
  currentUserGroups: number[];

  selectedProject: Project;
  wipViolations: WipViolation[];
  logs: Log[];

  isUserKanbanMaster_inGroup = false;
  isUserProductOwner_inGroup = false;
  canUserEdit = false;
  canUserDelete = false;
  selectedReason: DeleteReason = null;

  constructor(private prioritySerive: PriorityService,
              private boardsService: BoardsService,
              private route: ActivatedRoute,
              private boardsListService: BoardsListService,
              private router: Router,
              private cardService: CardsService,
              private userService: UsersService,
              private deleteReasonService: DeleteReasonsService,
              private _ngZone: NgZone,
              private ref: ChangeDetectorRef) { }


  ngOnInit() {
    this.canUserEdit = false;
    this.canUserDelete = false;
    this.loadPriorities();
    const user = JSON.parse(localStorage.getItem('user'));
    this.currentUserId = user['id'];
    this.today = new Date();
    this.sub = this.route.params.subscribe(params => {
      this.currectBoardId = +params['id']; // (+) converts string 'id' to a number
            // Check if the user is allowed to see this board.
            this.boardsListService.getBoards(this.currentUserId).subscribe(boards => {
              let isAllowed = false;
              Object.values(boards).forEach((x) => {
               if (x[1] === this.currectBoardId) { // x[1] is board id
                 isAllowed = true;
                }
              });
              if (!isAllowed) {
                this.router.navigate(['/boards-list']);
                return;
              }

             this.getBoard();

            }, err => {
              console.log('error geting boards from backend');
            });
   });


    this.isCurrentUserKanbanMaster = user.roles.includes('kanban master');
    this.isCurrentUserAdmin = user.roles.includes('admin');
    this.isCurrentUserProductOwner = user.roles.includes('product owner');
    this.isCurrentUserDeveloper = user.roles.includes('developer');

    this.newCardForm = new FormGroup({
      'title': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required),
      'assignee': new FormControl(null),
      'deadline': new FormControl(null),
      'priority': new FormControl(null, Validators.required),
      'size': new FormControl(),
      'project': new FormControl(null, Validators.required),
    });

    this.editCardForm = new FormGroup({
      'title-edit': new FormControl(null, Validators.required),
      'description-edit': new FormControl(null, Validators.required),
      'assignee-edit': new FormControl(null),
      'deadline-edit': new FormControl(null),
      'priority-edit': new FormControl(null, Validators.required),
      'size-edit': new FormControl(),
      'project-edit': new FormControl({disabled: true}),

    });

    this.deleteCardForm = new FormGroup({
      'reason': new FormControl(null, Validators.required),
    });
    // this.newCardForm.get('typeSilver').disable();

    // this.newCardForm.get('id').disable();

    this.sl = {
      dateFormat: 'yyyy-mm-dd',
      firstDayOfWeek: 1,
      dayNames: ['Nedelja', 'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota'],
      dayNamesShort: ['Ned', 'Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob'],
      dayNamesMin: ['Ne', 'Po', 'To', 'Sr', 'Če', 'Pe', 'So'],
      monthNames: [ 'Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij', 'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December' ],
      monthNamesShort: [ 'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec' ],
      today: 'Danes',
      clear: 'Počisti'
    };

    this.getUserGroups();
  }

  getBoard() {
    this.boardsService.getBoard(this.currectBoardId).subscribe(board => {
      this.board = <Board>board[0];
      this.projects = this.board.projects;
      this.getBoardUserData();

    }, err => {
      // Board doesn't exist. Redirect the user?
      console.log('Ni bilo mogoce dobiti table ' + err);
    });
  }

  getUserGroups() {
    this.userService.getUserGroups(this.currentUserId).subscribe(groups => {
      this.currentUserGroups = <number[]>groups;
    });
  }

  getBoardUserData() {
    const projects: Project[] = this.board.projects;
    this.currentUserProjects = [];
    projects.forEach(project => {
      let addProject = false;
      const groupMember: GroupMember = project.group_data.users.find(user => user.id === this.currentUserId);
      if (groupMember != null) {
        if (groupMember.allowed_group_roles.includes(2) && groupMember.group_active) {
          this.isUserProductOwner_inGroup = true;
          addProject = true;
        }
        if (groupMember.allowed_group_roles.includes(3) && groupMember.group_active) {
          this.isUserKanbanMaster_inGroup = true;
          addProject = true;
        }
      }
      // Pokaži projekte, na katerih je uporabnik bodisi kanban master bodisi product owner
      if (addProject) {
        this.currentUserProjects.push(project);
      }
    });
  }

  loadModal() {
    // Get changes
    this.newCardForm.reset();
    this.projects = [];
    this.currentUserProjects = [];
    this.getBoard();
    this.silverBullet = false;
    this.priorities = [];
    this.loadPriorities();
    this.cardsModalTitle = 'Nova kartica';
    this.newCardForm.reset();

  }

  loadPriorities() {
    this.prioritySerive.getProrities().subscribe(priorities => {
      this.priorities = <Priority[]>priorities;
      this.priorities.sort(function (a, b) {
        return a.value - b.value;
      });
    }, err => {
      console.log('Ni bilo mogoce dobiti prioritet ' + err);
    });
  }

  closeModal() {
    this.newCardForm.reset();
  }

  cancelCard() {
    this.newCardForm.reset();
  }

  updateTitle() {
    const groupMember: GroupMember = this.selectedProject.group_data.users.find(user => user.id === this.currentUserId);
    if (groupMember.allowed_group_roles.includes(2) && groupMember.group_active) {
      this.cardsModalTitle = 'Nova kartica (nova funkcionalnost)';
      this.silverBullet = false;
    }
    if (groupMember.allowed_group_roles.includes(3) && groupMember.group_active) {
      this.cardsModalTitle = 'Nova kartica (najvišja prioriteta)';
      this.silverBullet = true;

    }
  }

  saveCard() {
    // New card
    let columnID = 108;
    // Find correct columns
    // Find silver bullet column
    if (this.silverBullet) {
      // Preveri ali obstaja stolpec z najvišjo prioriteto
      if (this.board.type_priority_column_id == null) {
        UIkit.notification('Stolpec z najvišjo prioriteto ne obstaja.', {status: 'danger', timeout: 2000});
        return;
      } else {
        columnID = this.board.type_priority_column_id;
      }
    } else {
      // Find first column
      let columns = this.board.columns;
      columns.sort(function (a, b) {
        return a.display_offset - b.display_offset;
      });
      while (columns[0].subcolumns != null && columns[0].subcolumns.length !== 0) {
        columns = columns[0].subcolumns;
        columns.sort(function (a, b) {
          return a.display_offset - b.display_offset;
        });
      }
      columnID = columns[0].id;
    }

    // Get asignee or null
    let assigneeId = null;
    if ((<GroupMember>this.newCardForm.get('assignee').value) != null) {
      assigneeId = (<GroupMember>this.newCardForm.get('assignee').value).id;
    }
    // Get deadline or null
    let deadlineDate = null;
    if (this.newCardForm.get('deadline').value != null) {
      deadlineDate = (<Date>this.newCardForm.get('deadline').value).getFullYear() + '-' + ((<Date>this.newCardForm.get('deadline').value).getMonth() + 1) + '-' + (<Date>this.newCardForm.get('deadline').value).getDate();
    }

    // Create object
    const card: Card = {
      violation_user: this.currentUserId,
      card_id: null, // this.newCardForm.get('id').value,
      title: this.newCardForm.get('title').value,
      assigned_user_id: assigneeId,
      card_priority_id: (<Priority>this.newCardForm.get('priority').value).id,
      description: this.newCardForm.get('description').value,
      deadline: deadlineDate,
      project_id: (<Project>this.newCardForm.get('project').value).id,
      size: this.newCardForm.get('size').value, // can be null
      type_silver: this.silverBullet,
      number: 1,
      type_rejected: false,
      created_at: '2012-09-04 06:00:00.000000', // null?
      completed_at: null,
      started_at: null,
      display_offset: 0,
      delete_reason_id: null,
      active: true,
      column_id: columnID
    };

    console.log(JSON.stringify(card));

    // Send request
    this.cardService.postCard(card).subscribe(res => {
      UIkit.modal('#new-card-modal').hide();
      UIkit.notification('Kartica dodana.', {status: 'success', timeout: 2000});
      UIkit.modal('#new-card-modal').hide();
    }, err => {
      if (err.status === 406) {
        UIkit.notification('Kartica z najvišjo prioriteto že obstaja.', {status: 'danger', timeout: 2000});
      } else if (err.status === 409) {
        UIkit.notification('Kartica dodana, vendar je prišlo do kršitve omejitve WIP.', {status: 'warning', timeout: 2000});
        UIkit.modal('#new-card-modal').hide();
      } else {
        UIkit.notification('Napaka pri dodajanju nove kartice.', {status: 'danger', timeout: 2000});
      }
      console.log(err);
    });

   // UIkit.modal('#new-group-modal').hide();

  }
  saveEditedCard() {

    let deadlineDate = null;
    if (this.editCardForm.get('deadline-edit').value !== null) {
      deadlineDate = (<Date>this.editCardForm.get('deadline-edit').value).getFullYear() + '-' +
        ((<Date>this.editCardForm.get('deadline-edit').value).getMonth() + 1) + '-' +
        (<Date>this.editCardForm.get('deadline-edit').value).getDate();
    }

    this.selectedCard.title = this.editCardForm.get('title-edit').value;
    this.selectedCard.description = this.editCardForm.get('description-edit').value;
    if (this.editCardForm.get('assignee-edit') === null) {
      this.selectedCard.assigned_user_id = null;
    } else {
      this.selectedCard.assigned_user_id = this.editCardForm.get('assignee-edit').value;
    }
    this.selectedCard.deadline = deadlineDate;
    this.selectedCard.card_priority_id = this.editCardForm.get('priority-edit').value;
    this.selectedCard.size = this.editCardForm.get('size-edit').value;

    this.cardService.updateCard(this.selectedCard).subscribe(res => {
      UIkit.modal('#card-details-modal').hide();
      UIkit.notification('Kartica je posodobljena.', {status: 'success', timeout: 2000});
      UIkit.modal('#card-details-modal').hide();
      this.error = null;
      this.editCardForm.reset();
    }, err => {
      this.error = 'kartice ni bilo mogoče posodobiti. Prosimo poskusite kasneje';
      console.log('napaka pri posodablanju kartice');
    });
  }


  loadEditCardModal(cardDetails: CardDetailed) {
      this.canUserDelete = this.canDelete();
      this.canUserEdit = this.canEdit();
      this.editCardForm.reset();
      this.projects = [];
      this.currentUserProjects = [];
      this.getBoard();
      this.silverBullet = false;
      this.editCardForm.reset();
      this.cardsModalTitle = 'Uredi kartico';
      this.wipViolations = cardDetails.wip_violations;
      this.tasks = cardDetails.tasks;
      if (cardDetails.type_silver) {
        this.cardType = 'Kartica z najvišjo prioriteto';
      } else {
        this.cardType = 'Nova funkcionalnost';
      }

      console.log(this.tasks);
      this.logs = cardDetails.logs;
      this.selectedProject = cardDetails.project_id[0];
      this.editCardForm.get('title-edit').setValue(cardDetails.title);
      this.editCardForm.get('description-edit').setValue(cardDetails.description);
      this.editCardForm.get('project-edit').setValue(cardDetails.project_id[0].title);
      if (cardDetails.assigned_user_id != null) {
        this.editCardForm.get('assignee-edit').setValue(cardDetails.assigned_user_id.id);
      }
      if (cardDetails.deadline != null) {
        this.editCardForm.get('deadline-edit').setValue(new Date(cardDetails.deadline));
      }
      this.editCardForm.get('priority-edit').setValue(cardDetails.card_priority_id.id);
      if (cardDetails.size != null) {
        this.editCardForm.get('size-edit').setValue(cardDetails.size);
      }
  }

  getDeleteReasons(){
    this.deleteReasonService.getReasons().subscribe(reasons => {
      this.deleteReasons = <DeleteReason[]>reasons;
    }, err => {
      console.log('Ni bilo mogoce dobiti šifranta razlogov za brisanje ' + err);
    });
  }

  deleteCard(){

    this.selectedCard.active = false;
    this.selectedCard.delete_reason_id = this.selectedReason.id;
    console.log(this.selectedCard);
    this.cardService.updateCard(this.selectedCard).subscribe(res => {
      UIkit.modal('#delete-card-modal').hide();
      UIkit.modal('#card-details-modal').hide();
      UIkit.notification('Kartica izbrisana.', {status: 'success', timeout: 2000});
      this.error = null;
      this.editCardForm.reset();
    }, err => {
      this.error = 'kartice ni bilo mogoče izbrisati. Prosimo poskusite kasneje';
      console.log('napaka pri posodablanju kartice');
    });


  }

  canEdit() {
    let onProject = false;
    for (const p of this.board.projects) {
      if (p.id === this.selectedCard.project_id) {
        onProject = this.currentUserGroups.indexOf(+p.developer_group_id) >= 0;
      }
    }
    const leftColumnIndex = this.boardsService.enumeratedColumns.get(this.board.type_left_border_column_id);
    const rightColumnIndex = this.boardsService.enumeratedColumns.get(this.board.type_right_border_column_id);
    const columnIndex = this.boardsService.enumeratedColumns.get(this.selectedCard.column_id);
    console.log('ci: ', columnIndex, 'li: ', leftColumnIndex, ' ri: ', rightColumnIndex);
    if (columnIndex > rightColumnIndex) {
      return false;
    } else if (columnIndex < leftColumnIndex && (this.isCurrentUserKanbanMaster || this.isCurrentUserProductOwner) && onProject) {
      return true;
    } else if (columnIndex >= leftColumnIndex && columnIndex <= rightColumnIndex && (this.isCurrentUserKanbanMaster || this.isCurrentUserDeveloper) && onProject) {
      console.log('on project', onProject);
      return true;
    }
    console.log('on project', onProject, ' developer: ', this.isCurrentUserDeveloper);
    return false;
  }

  canDelete(){
    let onProject = false;
    //Preveri, da uporabnik briše samo kartice, ki pripadajo njegovemu projektu.
    let isUserProductOwner = false;
    let isUserKanbanMaster = false;
    for (const p of this.board.projects) {
      if (p.id === this.selectedCard.project_id) {
        console.log(p)    
        p.group_data.users.forEach(groupMember => {
          if(groupMember.id == this.currentUserId && groupMember.group_active){
            onProject = true;
            if (groupMember.allowed_group_roles.includes(2)) {
              isUserProductOwner = true;
            }
            if (groupMember.allowed_group_roles.includes(3)) {
              isUserKanbanMaster = true;
            }
          }
        });
      }
    }

    console.log("on project: ", onProject, " kanban master: ", isUserKanbanMaster, " product owner: ", isUserProductOwner);
    const leftColumnIndex = this.boardsService.enumeratedColumns.get(this.board.type_left_border_column_id);
    const rightColumnIndex = this.boardsService.enumeratedColumns.get(this.board.type_right_border_column_id);
    const columnIndex = this.boardsService.enumeratedColumns.get(this.selectedCard.column_id);
    //Preveri brisanje za vlogo Product Owner (lahko briše samo kartico, za katero se še ni pričel razvoj).
    if (columnIndex < leftColumnIndex && (isUserProductOwner) && onProject) {
      return true;
    //Preveri brisanje za vlogo KanbanMaster (lahko briše kartico v kateremkoli stolpcu).
    } else if (isUserKanbanMaster && onProject) {
      return true;
    }
    return false;
  }

  onCardClick(card) {
    this.cardService.getDetailedCard(card.card_id).subscribe(res => {
      this.selectedCard = card;
      this.canUserDelete = this.canDelete();
      const cardDetails: CardDetailed = <CardDetailed>res;
      this.loadEditCardModal(cardDetails);
      UIkit.modal('#card-details-modal').show();

      console.log("Can user delete: ", this.canUserDelete);
    }, err => {
      console.log(err);
    });
  }

}
