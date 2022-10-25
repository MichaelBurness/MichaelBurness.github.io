import { Component, Input, Output, EventEmitter } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Config, URL, reloadControllersList } from "../config";
import { ILoggedInUser } from "../interfaces";

@Component({
	selector: "ichen-login",
	templateUrl: "./login.component.html"
})
export class LoginComponent
{
	public user: string | null = null;
	public password: string | null = null;
	public isBusy = false;
	public isError = false;

	public get i18n() { return Config.i18n; }

	constructor(private http: HttpClient) { }

	public get isValidUser() { return this.user?.trim() ?? null; }
	public get isValidPassword() { return this.password?.trim() ?? null; }

	public async doLogin(ev: Event)
	{
		ev.preventDefault();

		if (this.isBusy) return;
		if (!this.user) return;
		if (!this.password) return;

		const login = { name: this.user, password: this.password };

		this.isBusy = true;
		this.isError = false;

		try {
			const user = await this.http.post<ILoggedInUser>(URL.login, JSON.stringify(login), {
				headers: new HttpHeaders({ "Content-Type": "application/json" })
			}).toPromise();

			console.log("Successfully logged in.", user);
			this.isBusy = false;
			this.isError = false;
			Config.currentUser = user;
			Config.forceLogin = false;

			Config.jumpToPage(URL.homeRoute);

			await reloadControllersList(this.http);
		} catch (err) {
			console.error(err);
			alert("Login failed.");

			Config.forceLogin = true;
			Config.currentUser = null;
			this.isBusy = false;
			this.isError = true;
		}
	}
}
