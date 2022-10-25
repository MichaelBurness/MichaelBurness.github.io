import { ApplicationRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { IDrawFormat, ILoggedInUser, IController, ITranslationDictionary, IDateRange } from "./interfaces";

// Constants

const iframeId = "downloadIFrame";
const urlRoot = (window as any).ServiceUrl || "";
const shiftStep = "08:00:00";		// 8-hour shifts
const timeZone = -(new Date()).getTimezoneOffset();

export const URL = {
	i18n: "lib/i18n.json",

	loginRoute: "routeLogin",
	homeRoute: "routeHome",
	login: `${urlRoot}/login`,
	logout: `${urlRoot}/logout`,
	currentUser: `${urlRoot}/user`,

	controllersList: `${urlRoot}/config/controllers`,
	eventsReport: `${urlRoot}/reports/events/{0}/{1}`,
	dataDownload: `${urlRoot}/reports/{0}/{1}`
};

export const Charts: {
	canvasId: string;
	cssPrefix: string;
	title: { [id: string]: any; };
	subtitle: { [id: string]: any; };
	colors: { [id: string]: IDrawFormat; };
} = {
	canvasId: "chartCanvas",
	cssPrefix: "ics-",
	title: { fontSize: 25, fontWeight: "bold", marginTop: 10, marginBottom: 5 },
	subtitle: { fontSize: 20, align: "center", marginBottom: 30 },
	colors: {
		"NoValue": { fill: "#fafafa", opacity: 0.7, text: "#aaa" },
		"Unknown": { fill: "#ff0", stroke: "#f00", text: "#700" },
		"OffLine": { fill: "#eee", stroke: "#ccc", text: "#333" },
		"Offline": { fill: "#eee", stroke: "#ccc", text: "#333" }
	}
};

// Load default time range with current date

const now = new Date();

const defaultDateRange: IDateRange = {
	fromDate: { year: now.getFullYear(), month: now.getMonth() + 1, day: 1 },
	toDate: { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
};

// Utility functions

function jumpToPage(page?: string) { throw new Error("Not implemented."); }

const currentUser: ILoggedInUser | null = null;

const Cfg: {
	lang: string;
	readonly urlRoot: string;
	appRef: ApplicationRef | null;
	iFrame: HTMLIFrameElement | null;
	jumpToPage: (page?: string) => void;
	currentUser: Readonly<ILoggedInUser> | null;
	forceLogin: boolean;
	controllersList: Readonly<IController>[] | null;
	i18n: ITranslationDictionary;
	readonly timeZone: number;
	readonly shiftStep: string;
	readonly defaultDateRange: IDateRange;
	currentDateRange: IDateRange;
} = {
	lang: "",
	urlRoot,
	appRef: null,
	get iFrame() { return document.getElementById(iframeId) as HTMLIFrameElement; },
	jumpToPage,
	currentUser,
	forceLogin: false,
	controllersList: null,
	i18n: {},
	timeZone,
	shiftStep,
	defaultDateRange,
	currentDateRange: defaultDateRange,
};

export async function reloadControllersList(http: HttpClient)
{
	try {
		// Get controllers
		const list = await http.get<{ [id: number]: IController; }>(URL.controllersList).toPromise();

		Cfg.controllersList = [];
		const clist = Cfg.controllersList;

		Object.values(list).forEach(val => clist.push(val));

		console.log("Controllers: ", Cfg.controllersList);
	} catch (err) {
		console.error("Cannot load controllers!");
		console.error(err);
	}
}

export const Config = Cfg;
