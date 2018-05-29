import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { BoardsListService } from '../shared/services/boards-list.service';
import { BoardsService } from '../shared/services/boards.service';
import { AnalyticsService } from '../shared/services/analytics.service';
import { ActivatedRoute } from '@angular/router';
declare var UIkit: any;

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy {

  typeOptions = [
    {name:'Nova zahteva', value:'new', checked:true},
    {name:'Silver bullet', value:'silver', checked:true},
    {name:'Zavrnjena kartica', value:'rejected', checked:true}
  ]

  projectOptions = [];

  get selectedTypeOptions() {
    return this.typeOptions
              .filter(opt => opt.checked)
              .map(opt => opt.value)
  }

  get selectedProjectOptions() {
    return this.projectOptions
              .filter(opt => opt.checked)
              .map(opt => opt.value)
  }

  id: number;
  private sub: any;
  sl:any;
  avgTimes: any;
  cards: any;

  sizeStart = null;
  sizeStop = null;
  createdStart = null;
  createdStop = null;
  finishedStart = null;
  finishedStop = null;
  developmentStart = null;
  developmentStop = null;

  currentUser: any;
  currentUserId = null;

  constructor(private boardsListService: BoardsListService, private router: Router,
              private route: ActivatedRoute, private boardsService: BoardsService,
              private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.avgTimes = [];
    this.cards = [];
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


          this.boardsService.getBoard(this.id).subscribe(board => {
            console.log(board[0]);
            board = board[0];
            board["projects"].forEach((proj) => {
              this.projectOptions.push({name:proj["title"], value:proj["id"], checked:true});
            });

          }, err => {
            // Board doesn't exist. Redirect the user?
            console.log('Ni bilo mogoce dobiti table ' + err);
          });

        }, err => {
          console.log('error geting boards from backend');
        });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getAverageLeadTime() {
    //"board_id": this.id,
    let reqData = {"project_ids": this.selectedProjectOptions, "types": this.selectedTypeOptions,
                      "createdStart": null,
                      "createdStop": null,
                      "finishedStart": null,
                      "finishedStop":null,
                      "developmentStart":null,
                      "developmentStop":null,
                      "sizeStart":null,
                      "sizeStop":null};
    console.log(reqData);

    // Error checking.
    // If all set, check if all above/below.
    //let sizeStart = this.sizeStart.value;
    if (this.createdStart != null && this.createdStop != null) {
      if (this.createdStart >= this.createdStop) {
        UIkit.notification('Prvi datum mora biti manjši od drugega: ustvarjena.', {status: 'danger', timeout: 2000});
        return;
      }
    }
    if (this.finishedStart != null && this.finishedStop != null) {
      if (this.finishedStart >= this.finishedStop) {
        UIkit.notification('Prvi datum mora biti manjši od drugega: končana.', {status: 'danger', timeout: 2000});
        return;
      }
    }
    if (this.developmentStart != null && this.developmentStop != null) {
      if (this.developmentStart >= this.developmentStop) {
        UIkit.notification('Prvi datum mora biti manjši od drugega: začetek razvoja.', {status: 'danger', timeout: 2000});
        return;
      }
    }
    if (this.sizeStart != null && this.sizeStop != null) {
      if (this.sizeStart >= this.sizeStop) {
        UIkit.notification('Prva vrednost mora biti manjša od druge: točke.', {status: 'danger', timeout: 2000});
        return;
      }
    }

    // Add the properties to reqData.
    reqData["createdStart"] = this.createdStart;
    reqData["createdStop"] = this.createdStop;
    reqData["finishedStart"] = this.finishedStart;
    reqData["finishedStop"] = this.finishedStop;
    reqData["developmentStart"] = this.developmentStart;
    reqData["developmentStop"] = this.developmentStop
    reqData["sizeStart"] = this.sizeStart;
    reqData["sizeStop"] = this.sizeStop;

    this.analyticsService.postAverageLeadTime(reqData).subscribe(data => {
      console.log(data);
      this.avgTimes = data["average"];
      this.cards = data["cards"];

    }, err => {
      console.log('Napaka ' + err);
    });
  }

}
