import { Component, Input, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Config, URL } from "../config";
import { ITimeRangeValuesByControllers, ITimeRangeValues, ITranslationDictionary, IRunReportParameters } from "../interfaces";
import { ReportBaseComponent } from "./report.base.component";
import { DrawDonutChart } from "../utils/draw-donut-chart";
import { DrawStackedBarCategoryChart } from "../utils/draw-stacked-bar-category-chart";
import { DrawStackedBarTimeChart } from "../utils/draw-stacked-bar-time-chart";

// Put Production first, Offline and Idle at back
const JobModeSortOrder: { [jobmode: string]: number; } = {
	"Unknown": 998,
	"ID01": 2,
	"ID02": 1,
	"ID03": 3,
	"ID04": 4,
	"ID05": 5,
	"ID06": 6,
	"ID07": 7,
	"ID08": 8,
	"ID09": 9,
	"ID10": 10,
	"ID11": 11,
	"ID12": 12,
	"ID13": 13,
	"ID14": 14,
	"ID15": 15,
	"Offline": 99,
	"NoValue": 999
};

@Component({
	selector: "ichen-report-jobmodes",
	templateUrl: "./report.jobmodes.component.html"
})
export class JobModesReportComponent extends ReportBaseComponent<ITimeRangeValuesByControllers | ITimeRangeValues[]>
{
	public showChart = false;
	public collapseHeader = false;

	constructor(http: HttpClient) { super(http); }

	public get i18n() { return Config.i18n; }

	public get title() { return this.i18n["titleJobModes"] as string; }

	private compareJobModes(a: string, b: string)
	{
		const asort = JobModeSortOrder[a];
		const bsort = JobModeSortOrder[b];

		return (asort < bsort) ? -1 : (asort > bsort) ? 1 : 0;
	}

	private formatJobMode(category: string, i18n: ITranslationDictionary)
	{
		return i18n["labelJobMode" + category] as string;
	}

	public async runReportAsync(parameters: IRunReportParameters)
	{
		this.clearChart();
		this.collapseHeader = false;

		const controllerId = parameters.controllerId;

		let url = URL.eventsReport;
		url = url.replace("{0}", parameters.byMachine ? "" : controllerId.toString())
			.replace("{1}", "JobMode")
			.replace("//", "/");

		url += "?timezone=" + Config.timeZone + "&from=" + parameters.lower + "&to=" + parameters.upper;

		if (parameters.step !== undefined) url += "&step=" + parameters.step;

		this.showChart = true;
		this.clearChart();

		await this.loadAsync(url);

		this.collapseHeader = true;

		if (!this.data) return;

		// Yield to update UI
		await new Promise(resolve => setTimeout(resolve, 10));

		// Create chart

		const timerange = parameters.from.substr(0, 10) + " - " + parameters.to.substr(0, 10);

		if (Array.isArray(this.data)) {
			if (this.data.length <= 0) {
				console.error("Chart has no data!");
			} else if (this.data.length <= 1) {
				//this.chartData = DrawPieChart(this.title, controllerId, timerange, this.data[0], this.i18n, this.compareJobModes, this.formatJobMode);
				this.chart = DrawDonutChart(this.title, controllerId, timerange, this.data[0], this.i18n, this.compareJobModes, this.formatJobMode);
			} else {
				// this.chartData = DrawStackedChart(this.title, controllerId, timerange, this.data, this.i18n, this.compareJobModes, this.formatJobMode, !!parameters.monthOnly);
				this.chart = DrawStackedBarTimeChart(this.title, controllerId, timerange, this.data, this.i18n, this.compareJobModes, this.formatJobMode, !!parameters.monthOnly);
			}
		} else {
			const xlabel = (parameters.byMachine ? this.i18n["labelMachine"] as string : null);
			// this.chartData = DrawCategorizedStackedChart(this.title, xlabel, timerange, this.data, this.i18n, this.compareJobModes, this.formatJobMode);
			this.chart = DrawStackedBarCategoryChart(this.title, xlabel, timerange, this.data, this.i18n, this.compareJobModes, this.formatJobMode);
		}
	}
}
