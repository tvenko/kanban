import { Component, OnInit, group } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Project } from '../shared/models/project.interface';
import { ProjectsService } from '../shared/services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { BoardsService } from '../shared/services/boards.service';
import { Board } from '../shared/models/board.interface';
import { User } from '../shared/models/user.interface';
import { GroupMember } from '../shared/models/group.interface';



@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  private sub: any;

  cardsModalTitle:String;
  newCardForm:FormGroup;
  projects:Project[] =[];
  board:Board;

  isCurrentUserAdmin:boolean;
  isCurrentUserKanbanMaster:boolean;
  isCurrentUserProductOwner:boolean;
  currentUserId:number;
  currectBoardId:number;
  today:Date;
  sl:any;

  isUserKanbanMaster_inGroup:boolean = false;
  isUserProductOwner_inGroup:boolean = false;

  constructor(private boardsService: BoardsService,private route: ActivatedRoute) { }

  ngOnInit() {
    this.today = new Date();
    this.sub = this.route.params.subscribe(params => {
      this.currectBoardId = +params['id']; // (+) converts string 'id' to a number
      this.getBoard();
   });

    //TODO: Vloge znotraj izbrane skupine, ne na sploh!
    let user = JSON.parse(localStorage.getItem('user'));
    this.isCurrentUserKanbanMaster = user.roles.includes("kanban master");
    this.isCurrentUserAdmin = user.roles.includes("admin");
    this.isCurrentUserProductOwner = user.roles.includes("product owner")
    this.currentUserId = user["id"];

    this.newCardForm = new FormGroup({
      'id': new FormControl(),
      'title': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required),
      'assignee': new FormControl(null, Validators.required),
      'deadline': new FormControl(null, Validators.required),
      'priority': new FormControl(null, Validators.required),
      'size': new FormControl(),
      'project': new FormControl(null, Validators.required),
      'typeSilver': new FormControl()
      

    });
    this.newCardForm.get('typeSilver').disable();
    this.newCardForm.get('id').disable();

    this.sl = {
      dateFormat:"yyyy-mm-dd",
      firstDayOfWeek: 1,
      dayNames: ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota"],
      dayNamesShort: ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"],
      dayNamesMin: ["Ne","Po","To","Sr","Če","Pe","So"],
      monthNames: [ "Januar","Februar","Marec","April","Maj","Junij","Julij","Avgust","September","Oktober","November","December" ],
      monthNamesShort: [ "Jan", "Feb", "Mar", "Apr", "Maj", "Jun","Jul", "Avg", "Sep", "Okt", "Nov", "Dec" ],
      today: 'Danes',
      clear: 'Počisti'
    };
  }


  getBoard() {
    this.boardsService.getBoard(this.currectBoardId).subscribe(board => {      
      this.board = <Board>board[0];
      this.getBoardUserData();
    }, err => {
      // Board doesn't exist. Redirect the user?
      console.log('Ni bilo mogoce dobiti table ' + err);
    });
  }

  getBoardUserData(){
    let projects:Project[] = this.board.projects;
    projects.forEach(project => {
      let groupMember:GroupMember = project.group_data.users.find(user=>user.id == this.currentUserId);
      if(groupMember.allowed_group_roles.includes(2)){
        this.isUserProductOwner_inGroup = true;
      }
      if(groupMember.allowed_group_roles.includes(3)){
        this.isUserKanbanMaster_inGroup = true;
      }
    });
  }

  loadModal(){
    if(this.isUserKanbanMaster_inGroup){
      this.cardsModalTitle ="Nova kartica (nujna zahteva)";
    }else{
      this.cardsModalTitle = "Nova kartica";
    }
    this.newCardForm.reset();
  }

  closeModal(){
    this.newCardForm.reset();
  }

  cancelCard(){
    this.newCardForm.reset();
  }

  saveCard(){

  }

}
