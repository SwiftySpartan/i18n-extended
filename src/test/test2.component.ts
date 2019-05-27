import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  setTranslateText: (text: string) => {};

  constructor() {
    this.setTranslateText('test2')
  }

  ngOnInit() {
  }

  test() {
    this.setTranslateText('i love this cli version 2')
  }
}
