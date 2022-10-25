import { Route, RouterModule } from "@angular/router";

import { URL } from "./config";
import { HomeComponent } from "./views/home.component";
import { LoginComponent } from "./views/login.component";
import { LogoutComponent } from "./views/logout.component";
import { JobModesReportComponent } from "./views/report.jobmodes.component";
import { OpModesReportComponent } from "./views/report.opmodes.component";
import { OperatorsReportComponent } from "./views/report.operators.component";
import { JobCardsReportComponent } from "./views/report.jobcards.component";
import { MoldsReportComponent } from "./views/report.molds.component";

export interface IRoute extends Route
{
	name: string;
	icon?: string;
	background?: string;
	hidden?: boolean;
}

export const AppRoutes: IRoute[] = [
	{ path: "login", name: "routeLogin", component: LoginComponent, hidden: true },
	{ path: "home", name: "routeHome", component: HomeComponent, icon: "download", background: "success" },
	{ path: "jobmodes", name: "routeJobModes", component: JobModesReportComponent, icon: "hand-up" },
	{ path: "opmodes", name: "routeOpModes", component: OpModesReportComponent, icon: "retweet" },
	{ path: "operators", name: "routeOperators", component: OperatorsReportComponent, icon: "user" },
	{ path: "jobcards", name: "routeJobCards", component: JobCardsReportComponent, icon: "credit-card" },
	{ path: "molds", name: "routeMolds", component: MoldsReportComponent, icon: "th-large" },
	{ path: "logout", name: "routeLogout", component: LogoutComponent, icon: "log-out", background: "danger" },
	{ path: "**", name: "routeDefault", redirectTo: "/home", hidden: true }
];

export const AppComponentsList = [
	HomeComponent,
	LoginComponent,
	LogoutComponent,
	JobModesReportComponent,
	OpModesReportComponent,
	OperatorsReportComponent,
	JobCardsReportComponent,
	MoldsReportComponent
];

URL.loginRoute = (AppRoutes.find(r => r.component === LoginComponent) as IRoute).name;
URL.homeRoute = (AppRoutes.find(r => r.component === HomeComponent) as IRoute).name;

export const AppRouterModule = RouterModule.forRoot(AppRoutes);
