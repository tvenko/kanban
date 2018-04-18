import { Component, OnInit, group } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Project } from '../shared/models/project.interface';
import { ProjectsService } from '../shared/services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { BoardsService } from '../shared/services/boards.service';
import { Board } from '../shared/models/board.interface';
import { User } from '../shared/models/user.interface';
import { GroupMember } from '../shared/models/group.interface';
import { Card } from '../shared/models/card.interface';
import { Priority } from '../shared/models/priority.interface';
import { PriorityService } from '../shared/services/priority.service';
import { CardsService } from '../shared/services/cards.service';
import { BoardsListService } from '../shared/services/boards-list.service';
import {Router} from '@angular/router';
declare var UIkit: any;


@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  private sub: any;

  cardsModalTitle: String;
  newCardForm: FormGroup;
  projects: Project[] = [];
  board: Board;
  priorities: Priority[];

  isCurrentUserAdmin: boolean;
  isCurrentUserKanbanMaster: boolean;
  isCurrentUserProductOwner: boolean;
  currentUserId: number;
  currectBoardId: number;
  today: Date;
  sl: any;

  selectedProject:Project;

  isUserKanbanMaster_inGroup = false;
  isUserProductOwner_inGroup = false;

    constructor(private prioritySerive: PriorityService, private boardsService: BoardsService, private route: ActivatedRoute, private boardsListService: BoardsListService, private router: Router, private cardService:CardsService) { }


  ngOnInit() {
     const user = JSON.parse(localStorage.getItem('user'));
     this.currentUserId = user['id'];
    this.today = new Date();
    this.sub = this.route.params.subscribe(params => {
      this.currectBoardId = +params['id']; // (+) converts string 'id' to a number
            // Check if the user is allowed to see this board.
            this.boardsListService.getBoards(this.currentUserId).subscribe(boards => {
              let isAllowed = false;
              Object.values(boards).forEach((x) => {
               if (x[1] == this.currectBoardId) { //x[1] is board id
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


    this.newCardForm = new FormGroup({
      //'id': new FormControl(),
      'title': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required),
      'assignee': new FormControl(null, Validators.required),
      'deadline': new FormControl(null, Validators.required),
      'priority': new FormControl(),
      'size': new FormControl(),
      'project': new FormControl(null, Validators.required),

    });
    //this.newCardForm.get('typeSilver').disable();

    //this.newCardForm.get('id').disable();

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


  getBoardUserData() {
    const projects: Project[] = this.board.projects;
    projects.forEach(project => {
      const groupMember: GroupMember = project.group_data.users.find(user => user.id == this.currentUserId);
      if (groupMember.allowed_group_roles.includes(2) && groupMember.group_active) {
        this.isUserProductOwner_inGroup = true;
      }
      if (groupMember.allowed_group_roles.includes(3) && groupMember.group_active) {
        this.isUserKanbanMaster_inGroup = true;
      }
    });
  }

  loadModal() {
    this.loadPriorities();
    if (this.isUserKanbanMaster_inGroup) {
      this.cardsModalTitle = 'Nova kartica (nujna zahteva)';
    } else {
      this.cardsModalTitle = 'Nova kartica';
    }
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

  saveCard() {
    //New card
    //Create object
    const card: Card = {
      card_id:null, //this.newCardForm.get('id').value,
      title: this.newCardForm.get('title').value,
      assigned_user_id: (<GroupMember>this.newCardForm.get('assignee').value).id,
      card_priority_id: (<Priority>this.newCardForm.get('priority').value).id,
      description: this.newCardForm.get('description').value,
      deadline: (<Date>this.newCardForm.get('deadline').value).getFullYear() + '-' + ((<Date>this.newCardForm.get('deadline').value).getMonth() + 1) + '-' + (<Date>this.newCardForm.get('deadline').value).getDate(),
      project_id: (<Project>this.newCardForm.get('project').value).id,
      size: this.newCardForm.get('size').value,
      type_silver: this.isUserKanbanMaster_inGroup, // Če doda kartico kanban master je to avtomatsko nujna zahteva
      number: -1,
      type_rejected: false,
      created_at: "2012-09-04 06:00:00.000000",
      completed_at: "2012-09-04 06:00:00.000000",
      started_at: "2012-09-04 06:00:00.000000",
      display_offset:0,
      delete_reason_id: 1,
      active:true,
      column_id:109
    };
    //Send request
    this.cardService.postCard(card).subscribe(res => {
      UIkit.modal('#new-card-modal').hide();
      UIkit.notification('Kartica dodana.', {status: 'success', timeout: 2000});
      UIkit.modal('#new-card-modal').hide();
    }, err => {
      //TODO: loči napako, ko že obstaja silver
      UIkit.notification('Napaka pri dodajanju nove kartice.', {status: 'danger', timeout: 2000});
      console.log(err);
    });  

   // UIkit.modal('#new-group-modal').hide();

  }

}
