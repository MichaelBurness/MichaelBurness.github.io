import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Config, URL } from "../config";
import { IController } from "../interfaces";

@Component({
	selector: "ichen-logout",
	templateUrl: "./logout.component.html"
})
export class LogoutComponent
{
	public currentUser = Config.currentUser;
	public controllersList: IController[] = [];

	public get i18n() { return Config.i18n; }

	constructor(private http: HttpClient)
	{
		this.doLogoutAsync();
	}

	public async doLogoutAsync()
	{
		Config.currentUser = null;
		Config.forceLogin = true;

		await this.http.get(URL.logout);
		console.log("Successfully logged out.");
		Config.jumpToPage();
	}
}
