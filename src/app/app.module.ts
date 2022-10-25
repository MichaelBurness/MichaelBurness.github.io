import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { AngularMyDatePickerModule } from "angular-mydatepicker";

import { AppRouterModule, AppComponentsList } from "./app.routes";
import { AppComponent } from "./app.component";
import { ReportDownloadComponent } from "./views/report.download.component";
import { ReportHeaderComponent } from "./views/report.header.component";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		AngularMyDatePickerModule,
		AppRouterModule
	],

	declarations: [
		AppComponent,
		ReportDownloadComponent,
		ReportHeaderComponent,

		...AppComponentsList
	],

	bootstrap: [AppComponent]
})
export class AppModule
{
}
