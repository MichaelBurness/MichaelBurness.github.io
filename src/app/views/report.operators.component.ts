import { Component, Input, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Config, URL } from "../config";
import { ITimeRangeValuesByControllers, ITimeRangeValues, ITranslationDictionary, IRunReportParameters } from "../interfaces";
import { ReportBaseComponent } from "./report.base.component";
import { DrawDonutChart } from "../utils/draw-donut-chart";
import { DrawStackedBarCategoryChart } from "../utils/draw-stacked-bar-category-chart";
import { DrawStackedBarTimeChart } from "../utils/draw-stacked-bar-time-chart";

@Component({
	selector: "ichen-report-operators",
	templateUrl: "./report.operators.component.html"
})
export class OperatorsReportComponent extends ReportBaseComponent<ITimeRangeValuesByControllers | ITimeRangeValues[]>
{
	public showChart = false;
	public collapseHeader = false;

	constructor(http: HttpClient) { super(http); }

	public get i18n() { return Config.i18n; }

	public get title() { return this.i18n["titleOperators"] as string; }

	private compareOperators(a: string, b: string)
	{
		let aval = parseInt(a, 10);
		let bval = parseInt(b, 10);

		switch (a) {
			case "0": aval = 1e99; break;
			case "NoValue": aval = 2e99; break;
		}
		switch (b) {
			case "0": bval = 1e99; break;
			case "NoValue": bval = 2e99; break;
		}

		return (aval < bval) ? -1 : (aval > bval) ? 1 : 0;
	}

	private formatOperator(category: string, i18n: ITranslationDictionary)
	{
		if (category === "0") return i18n["labelNone"] as string;
		if (category === "NoValue") return i18n["labelNoValue"] as string;
		return category;
	}

	public async runReportAsync(parameters: IRunReportParameters)
	{
		this.clearChart();
		this.collapseHeader = false;

		const controllerId = parameters.controllerId;

		let url = URL.eventsReport;
		url = url.replace("{0}", parameters.byMachine ? "" : controllerId.toString())
			.replace("{1}", "Operator")
			.replace("//", "/");

		url += "?timezone=" + Config.timeZone + "&from=" + parameters.lower + "&to=" + parameters.upper;

		if (parameters.step !== undefined) url += "&step=" + parameters.step;

		this.showChart = true;
		this.clearChart();

		await this.loadAsync(url);

		this.collapseHeader = true;

		// Yield to update UI
		await new Promise(resolve => setTimeout(resolve, 10));

		// Create chart

		if (!this.data) return;

		const timerange = parameters.from.substr(0, 10) + " - " + parameters.to.substr(0, 10);

		if (Array.isArray(this.data)) {
			if (this.data.length <= 0) {
				console.error("Chart has no data!");
			} else if (this.data.length <= 1) {
				//this.chartData = DrawPieChart(this.title, controllerId, timerange, this.data[0], this.i18n, this.compareOperators, this.formatOperator);
				this.chart = DrawDonutChart(this.title, controllerId, timerange, this.data[0], this.i18n, this.compareOperators, this.formatOperator);
			} else {
				// this.chartData = DrawStackedChart(this.title, controllerId, timerange, this.data, this.i18n, this.compareOperators, this.formatOperator, !!parameters.monthOnly);
				this.chart = DrawStackedBarTimeChart(this.title, controllerId, timerange, this.data, this.i18n, this.compareOperators, this.formatOperator, !!parameters.monthOnly);
			}
		} else {
			const xlabel = (parameters.byMachine ? this.i18n["labelMachine"] as string : null);
			//this.chartData = DrawCategorizedStackedChart(this.title, xlabel, timerange, this.data, this.i18n, this.compareOperators, this.formatOperator);
			this.chart = DrawStackedBarCategoryChart(this.title, xlabel, timerange, this.data, this.i18n, this.compareOperators, this.formatOperator);
		}
	}
}
