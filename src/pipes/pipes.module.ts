import { NgModule } from '@angular/core';
import { Sanitize } from './sanitize/sanitize';
import { ReversePipe } from './reverse/reverse';
import { SearchPipe } from './search/search';
import { TimeAgo2Pipe } from './time-ago2/time-ago2';

@NgModule({
	declarations: [Sanitize,
    ReversePipe,
    SearchPipe,
    TimeAgo2Pipe],
	imports: [],
	exports: [Sanitize,
    ReversePipe,
    SearchPipe,
    TimeAgo2Pipe]
})
export class PipesModule {}
