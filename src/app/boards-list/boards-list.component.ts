import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';
import {User} from '../shared/models/user.interface';
import { UsersService } from '../shared/services/users.service';
import { BoardsListService } from '../shared/services/boards-list.service';
import { BoardsService } from '../shared/services/boards.service';
import { Router } from '@angular/router';
declare var UIkit: any;

@Component({
  selector: 'app-boards-list',
  templateUrl: './boards-list.component.html',
  styleUrls: ['./boards-list.component.css']
})



export class BoardsListComponent implements OnInit {

  boards;
  selectedBoard;
  boardName: string;
  boardNameInput: FormControl;
  boardModalTitle: string;
  isCurrentUserKanbanMaster = false;
  isCurrentUserAdmin = false;
  currentUserId = null;
  displayOwnOnly = false;

  constructor(private boardsListService: BoardsListService, private router: Router,
              private boardsService: BoardsService) {
    this.boards = [];
    this.selectedBoard = null;
  }

  ngOnInit() {
    let user = JSON.parse(localStorage.getItem('user'));
    this.isCurrentUserKanbanMaster = user.roles.includes("kanban master");
    this.isCurrentUserAdmin = user.roles.includes("admin");
    this.currentUserId = user["id"];
    this.loadBoards();
    this.boardNameInput = new FormControl(null, Validators.required);
  }

  redirect(board_id) {
    this.router.navigate(['/board', board_id]);
  }

  displayOwnOnlySwitch (e) {
    if (e.target.checked) {
      this.displayOwnOnly = true;
    }
    else {
      this.displayOwnOnly = false;;
    }
    this.loadBoards();
}

  loadBoards() {
    this.boardsListService.getBoards(this.currentUserId).subscribe(boards => {
      // Filter - this.displayOwnOnly
      if (this.displayOwnOnly) {
        boards = Object.values(boards).filter((board, index, array) => {
          return board[3]
        });
      }


      this.boards = boards;
      this.boards.sort(function (a, b) {
        return a.id - b.id;
      });
    }, err => {
      console.log('error geting boards from backend');
    });                                       
  }

  deleteBoard(board, event) {
    event.stopPropagation();
    let confirmDelete = confirm('Izbrišem tablo?');
    if (confirmDelete) {
      this.boardsListService.deleteBoard(board[1]).subscribe(msg => {
        this.loadBoards();
        UIkit.notification('Tabla izbrisana.', {status: 'warning', timeout: 2000});
      }, err => {
        console.log('error deleting board from backend');
        UIkit.notification('Tabla ni izbrisana. Vzrok: _____', {status: 'danger', timeout: 2000});
      });
    }
  }

  editBoard(board, event) {
    event.stopPropagation();
    this.boardModalTitle = "Uredi tablo";
    this.selectedBoard = board;
    this.boardNameInput.setValue(board[0]);
  }

  //******** NEW BOARD MODAL *********//

  loadModal() {
    this.boardNameInput.setValue('');
    this.selectedBoard = null;
    this.boardModalTitle = "Nova tabla";
  }


  saveBoard() {
    if (this.boardNameInput.value == '') {
      alert('Vnesi ime table.');
    } else {
      if (this.selectedBoard != null) {
        //Create object
        const board = {
          id:this.selectedBoard[1],
          title:this.boardName
        };
        //Update board
        // Workaround. Get the board, change the title, send it back.
        this.boardsService.getBoard(board["id"]).subscribe(msg => {
          msg[0]["title"] = board["title"];
          this.boardsListService.updateBoard(msg[0]).subscribe(res => {        
            UIkit.modal('#new-board-modal').hide();
            UIkit.notification('Tabla urejena.', {status: 'success', timeout: 2000});
            UIkit.modal('#new-board-modal').hide();
            this.loadBoards();
          }, err => {
            UIkit.notification('Napaka pri urejanju table.', {status: 'danger', timeout: 2000});
            console.log(err);
          }); 

        }, err => {
          UIkit.notification('Napaka pri urejanju table.', {status: 'danger', timeout: 2000});
          console.log(err);
        });

        UIkit.modal('#new-board-modal').hide();

      } else {
        //New board
        //Create object
        const board = {
          id:null,
          title:this.boardName
        };
        //Send request
        this.boardsListService.postBoard(board).subscribe(res => {        
          UIkit.modal('#new-board-modal').hide();
          UIkit.notification('Tabla dodana.', {status: 'success', timeout: 2000});
          UIkit.modal('#new-board-modal').hide();
          this.loadBoards();
        }, err => {
          UIkit.notification('Napaka pri dodajanju nove table.', {status: 'danger', timeout: 2000});
          console.log(err);
        });  

        UIkit.modal('#new-board-modal').hide();
      }    
    }

  }

    cancelBoard(){
      this.loadBoards();
    }
}
