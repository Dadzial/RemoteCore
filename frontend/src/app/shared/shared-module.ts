import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ToolBar} from './components/tool-bar/tool-bar';


@NgModule({
  declarations: [],
  imports: [CommonModule,ToolBar],
  exports: [CommonModule,ToolBar]
})
export class SharedModule {}
