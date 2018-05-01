import { Component, OnInit } from '@angular/core';
import * as data from './documentation.json';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit {

  allDocs = null;
  filteredDocs = null;
  searchBox = null;
  clearButton = null;

  constructor() { }

  ngOnInit() {
    // Read the docs file.
    this.allDocs = data;
    this.filteredDocs = this.allDocs;
    this.searchBox = document.getElementById("search-box");
    this.clearButton = document.getElementById("btn-clear");
    this.clearButton.style.visibility = "hidden";
  }

  onSearchChange(searchValue : string ) {
    let searchTokens = searchValue.toUpperCase().split(' ');
    searchTokens = searchTokens.filter(token => token != '');
    if (searchTokens.length > 0) {
      this.clearButton.style.visibility = "visible";
      this.filteredDocs = this.allDocs.filter(doc =>
        searchTokens.every(token =>
          doc.title.toUpperCase().indexOf(token) > -1));
    }
    else {
      this.clearButton.style.visibility = "hidden";
      this.filteredDocs = this.allDocs;
    }
    
  }

  clearSearch() {
    this.searchBox.value = "";
    this.onSearchChange("");
  }

  moveToAnchor(docIndex) {
    document.getElementById("doc" + docIndex).scrollIntoView(false);
  }

}
