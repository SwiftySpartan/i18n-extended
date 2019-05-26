import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  setTranslateText: (text: string) => {};

  constructor() {
    this.setTranslateText('test')
    this.setTranslateText('okay')
    this.setTranslateText('cool')
  }

  ngOnInit() {
  }

  test() {
    this.setTranslateText('Andrew')
    this.setTranslateText('is')
    this.setTranslateText('so')
    this.setTranslateText('cool')
  }
}
