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


  columns: any;
  today: Date;
  tomorrow: Date;
  columnStart = null;
  columnStop = null;
  startDate = null;
  endDate = null;

  constructor(private boardsListService: BoardsListService, private router: Router,
              private route: ActivatedRoute, private boardsService: BoardsService,
              private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.today = new Date();
    this.tomorrow = new Date();
    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
    this.avgTimes = [];
    this.cards = [];
    this.columns = [];
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
            board["columns"].forEach((column) => {
              this.columns.push({id:column["id"], title:column["title"]});
            });
            console.log(this.columns);

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


  getComulative() {
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

    if (this.columnStart != null && this.columnStop != null) {
      if (this.columnStart >= this.columnStop) {
        UIkit.notification('Prvi stolpec mora biti levo od drugega.', {status: 'danger', timeout: 2000});
        return;
      }
    }
    else {
      UIkit.notification('Izberi oba stolpca.', {status: 'danger', timeout: 2000});
      return;
    }
    if (this.startDate != null && this.endDate != null) {
      if (this.startDate >= this.endDate) {
        UIkit.notification('Prvi datum mora biti manjši od drugega: časovno obdobje.', {status: 'danger', timeout: 2000});
        return;
      }
    }
    else {
      UIkit.notification('Izberi oba datuma: časovno obdobje.', {status: 'danger', timeout: 2000});
      return;
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

    reqData["start_date"] = this.formatDate(this.startDate);
    reqData["end_date"] = this.formatDate(this.endDate);

    let filteredColumns = this.columns.filter((col) => {
      return col["id"] >= this.columnStart && col["id"] <= this.columnStop;
    });
    reqData["columns"] = filteredColumns.map((col) => {
      return col["id"];
    });

    console.log(reqData);

    this.analyticsService.postComulative(reqData).subscribe(data => {
      console.log(data);
      // this.avgTimes = data["average"];
      // this.cards = data["cards"];

    }, err => {
      console.log('Napaka ' + err);
    });
  }

  formatDate(date) {
    var d = date,
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }



}


// {
//   "project_ids": [1],
//   "createdStart": null,
//   "createdStop": null,
//   "finishedStart": null,
//   "finishedStop":null,
//   "developmentStart":null,
//   "developmentStop":null,
// "sizeStart":null,
// "sizeStop":null,
// "start_date":"2018-05-30",
// "end_date":"2018-06-01",
// "columns": [11,12,21,22],
// "types"😞"new"]

// }


// columnStart = null;
//   columnStop = null;
//   startDate = null;
//   endDate = null;






// DELA REQ
// {
//   "project_ids": [16],
//   "createdStart": null,
//   "createdStop": null,
//   "finishedStart": null,
//   "finishedStop":null,
//   "developmentStart":null,
//   "developmentStop":null,
// "sizeStart":null,
// "sizeStop":null,
// "start_date":"2018-05-1",
// "end_date":"2018-06-10",
// "columns": [161, 162],
// "types": ["new"]
// }
