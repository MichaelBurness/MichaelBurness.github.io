import { Component, Input, Output, enableProdMode, ApplicationRef } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Config, URL, Charts, reloadControllersList } from "./config";
import { switchLanguage } from "./app.languages";
import { AppRoutes } from "./app.routes";

import * as am4core from "@amcharts/amcharts4/core";
import AnimatedChartTheme from "@amcharts/amcharts4/themes/animated";
import MaterialChartTheme from "@amcharts/amcharts4/themes/material";

import { ILoggedInUser } from "./interfaces";

enableProdMode();

// am4core.options.autoSetClassName = true;
am4core.options.classNamePrefix = Charts.cssPrefix;

am4core.useTheme(AnimatedChartTheme);
am4core.useTheme(MaterialChartTheme);

@Component({
	selector: "ichen-analytics",
	templateUrl: "app.component.html"
})
export class AppComponent
{
	public get i18n() { return Config.i18n; }
	public get currentLang() { return Config.lang; }
	public readonly routes = AppRoutes.filter(r => !r.hidden);

	constructor(private location: Location, private router: Router, private http: HttpClient, private app: ApplicationRef)
	{
		Config.jumpToPage = this.jumpToPage.bind(this);
		Config.appRef = app;

		this.loadAsync();
	}

	private jumpToPage(page = URL.loginRoute)
	{
		return this.router.navigate(AppRoutes.filter(r => r.name === page).map(r => "/" + r.path));
	}

	public isRouteActive(path: string)
	{
		const loc = this.location.path();
		const n = loc.lastIndexOf(path);
		return (n >= 0) && (path.length + n >= loc.length);
	}

	public switchLanguage(lang: string)
	{
		if (Config.lang !== lang) switchLanguage(lang);
	}

	private async loadAsync(): Promise<void>
	{
		try {
			// Get current logged-in user
			const user = await this.http.get<ILoggedInUser>(URL.currentUser).toPromise();

			Config.currentUser = user;
			console.log("Current user: ", user);

			await reloadControllersList(this.http);
		} catch (err) {
			console.error(err);

			switch (err.status) {
				case 401: console.error("Not logged in. Redirecting to login page..."); break;
				default: console.error("Cannot load current user!"); break;
			}
			Config.forceLogin = true;
			Config.currentUser = null;
			Config.controllersList = null;
			Config.jumpToPage();
		}
	}
}
