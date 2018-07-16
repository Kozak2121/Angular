import { Component, ElementRef, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { times } from 'lodash';
import moment = require('moment');

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})

export class TimelineComponent implements OnInit {
  currentWeekDay: number;
  @ViewChild('line')
  timeLine: ElementRef;

  @ViewChild('lineWrapper')
  timeLineWrapper: ElementRef;

  @ViewChild('pointWrapper')
  pointWrapper: ElementRef;

  @ViewChild('translated')
  translated: ElementRef;

  @Output()
  currentDate: number;

  pointPositions: any;
  points: any[] = [];

  transform: number;
  clientWidth;
  clientPadding;

  constructor(private domSanitizer: DomSanitizer,
              private renderer: Renderer2) {
    this.currentDate = moment().unix();
    this.transform = 0;
  }

  ngOnInit() {
    this.currentWeekDay = moment().isoWeekday();
    this.clientWidth = this.timeLineWrapper.nativeElement.clientWidth * 0.9;

    this.clientPadding = (this.timeLineWrapper.nativeElement.clientWidth - this.clientWidth) / 2;

    this.points = times(8, i => ({
      left: this.domSanitizer.bypassSecurityTrustStyle(`${(this.clientWidth / 7 * i) + this.clientPadding}px`),
      date: moment(this.currentDate * 1000).add(1, 'day').subtract(7 - i, 'day').toDate(),
      selected: moment(this.currentDate * 1000).add(1, 'day').subtract(7 - i, 'day').unix() === this.currentDate,
    }));
  }

  public changeWeek(value) {
    const method = value > 0 ? 'add' : 'subtract';
    this.currentDate = moment(this.currentDate * 1000)[method](1, 'day').unix();
    const prevSelected = this.points.findIndex(p => p.selected);
    this.points[prevSelected].selected = false;

    if (value > 0) {
      this.points[prevSelected + 1].selected = true;
      if (prevSelected + 1 === this.points.length - 1) {
        this.pushPoint();
      }
      this.transform -= (this.clientWidth / 7);
    } else {
      this.points[prevSelected - 1].selected = true;
      this.unshiftPoint(1);
      this.transform += (this.clientWidth / 7);
    }
    this.renderer.setStyle(this.translated.nativeElement, 'transform', `translateX(${this.transform}px)`);
  }

  public changeDay(point) {
    const curPointIndex = this.points.findIndex(p => p.date === point.date);
    const prevSelected = this.points.findIndex(p => p.selected);
    this.points.forEach(p => p.selected = false);
    point.selected = true;

    if (curPointIndex - prevSelected > 0) {
      if (prevSelected + 1 === this.points.length - 1) {
        this.pushPoint();
      }
    } else {
      this.unshiftPoint(curPointIndex - prevSelected);
    }
    this.transform += (this.clientWidth / 7) * -(curPointIndex - prevSelected);
    this.renderer.setStyle(this.translated.nativeElement, 'transform', `translateX(${this.transform}px)`);
  }

  private unshiftPoint(count: number) {
    times(Math.abs(count), () => {
      const offset = this.getOffset(-1);
      this.points.unshift({
        left: this.domSanitizer.bypassSecurityTrustStyle(`${offset}px`),
        date: moment(this.points[0].date).subtract(1, 'day').toDate(),
      });
    });
  }

  private pushPoint() {
    const offset = this.getOffset(1);
    this.points.push({
      left: this.domSanitizer.bypassSecurityTrustStyle(`${offset}px`),
      date: moment(this.points[this.points.length - 1].date).add(1, 'day').toDate(),
    });
  }

  private getOffset(dir: number) {
    let controlLeft;
    if (dir > 0) {
      controlLeft = this.points[this.points.length - 1].left.changingThisBreaksApplicationSecurity.split('px')[0];
    } else {
      controlLeft = this.points[0].left.changingThisBreaksApplicationSecurity.split('px')[0];
    }
    return (this.clientWidth / 7 * (((controlLeft - this.clientPadding) / (this.clientWidth / 7) + dir))) + this.clientPadding;
  }
}
