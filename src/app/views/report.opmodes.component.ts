import { Component, Input, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Config, URL } from "../config";
import { ITimeRangeValuesByControllers, ITimeRangeValues, ITranslationDictionary, IRunReportParameters } from "../interfaces";
import { ReportBaseComponent } from "./report.base.component";
import { DrawDonutChart } from "../utils/draw-donut-chart";
import { DrawStackedBarTimeChart } from "../utils/draw-stacked-bar-time-chart";
import { DrawStackedBarCategoryChart } from "../utils/draw-stacked-bar-category-chart";

const OpModeSortOrder: { [opmode: string]: number; } = {
	"Manual": 1,
	"SemiAutomatic": 2,
	"Automatic": 3,
	"Others": 4,
	"Offline": 9,
	"Unknown": 998,
	"NoValue": 999
};

@Component({
	selector: "ichen-report-opmodes",
	templateUrl: "./report.opmodes.component.html"
})
export class OpModesReportComponent
	extends ReportBaseComponent<ITimeRangeValuesByControllers | ITimeRangeValues[]>
{
	public showChart = false;
	public collapseHeader = false;

	constructor(http: HttpClient) { super(http); }

	public get i18n() { return Config.i18n; }

	public get title() { return this.i18n["titleOpModes"] as string; }

	public get requiredFilter() { return "Status"; }

	private compareOpModes(a: string, b: string)
	{
		const asort = OpModeSortOrder[a];
		const bsort = OpModeSortOrder[b];

		return (asort < bsort) ? -1 : (asort > bsort) ? 1 : 0;
	}

	private formatOpMode(category: string, i18n: ITranslationDictionary)
	{
		return i18n["labelOpMode" + category] as string;
	}

	public async runReportAsync(parameters: IRunReportParameters)
	{
		this.clearChart();
		this.collapseHeader = false;

		const controllerId = parameters.controllerId;

		let url = URL.eventsReport
			.replace("{0}", parameters.byMachine ? "" : controllerId.toString())
			.replace("{1}", "OpMode")
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
				//this.chartData = DrawPieChart(this.title, controllerId, timerange, this.data[0], this.i18n, this.compareOpModes, this.formatOpMode);
				this.chart = DrawDonutChart(this.title, controllerId, timerange, this.data[0], this.i18n, this.compareOpModes, this.formatOpMode);
			} else {
				//this.chartData = DrawStackedChart(this.title, controllerId, timerange, this.data, this.i18n, this.compareOpModes, this.formatOpMode, !!parameters.monthOnly);
				this.chart = DrawStackedBarTimeChart(this.title, controllerId, timerange, this.data, this.i18n, this.compareOpModes, this.formatOpMode, !!parameters.monthOnly);
			}
		} else {
			const xlabel = (parameters.byMachine ? this.i18n["labelMachine"] as string : null);
			//this.chartData = DrawCategorizedStackedChart(this.title, xlabel, timerange, this.data, this.i18n, this.compareOpModes, this.formatOpMode);
			this.chart = DrawStackedBarCategoryChart(this.title, xlabel, timerange, this.data, this.i18n, this.compareOpModes, this.formatOpMode);
		}
	}
}
