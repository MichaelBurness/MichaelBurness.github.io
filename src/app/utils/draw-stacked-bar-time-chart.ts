import { Config, Charts } from "../config";
import { ITimeRangeValues, ITranslationDictionary, IStackedChartDataPoint } from "../interfaces";
import CollectCategories from "../utils/collect-categories";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { CreateExportMenu, AddChartTitles, ShowIndicator, HideIndicator } from "../utils/amCharts";

// Main charting function

export function DrawStackedBarTimeChart(
	title: string | null,
	controllerId: number,
	timeRange: string,
	data: ITimeRangeValues[],
	i18n: ITranslationDictionary,
	categoriesSort: ((a: string, b: string) => number) | null,
	formatCategory: ((category: string, i18n: ITranslationDictionary) => string) | null,
	monthOnly: boolean
)
{
	data.sort((a, b) => a.startTime < b.startTime ? -1 : (a.startTime > b.startTime ? 1 : 0));

	// Build chart dates

	const dateslist = data.map((val, i) => new Date(val.startTime));

	console.debug("Dates:", dateslist);

	const hasTime = dateslist.length > 1 && (dateslist[1].getTime() - dateslist[0].getTime()) < 86400000;

	// Collect categories

	const categories = CollectCategories(data);

	// Build chart series

	const chartdata: IStackedChartDataPoint[] = [];
	const series: string[] = [];

	categories.forEach((list, category) =>
	{
		// Do not chart categories that are empty
		if (!list.some(x => x !== undefined)) return;

		series.push(category);

		if (chartdata.length <= 0) {
			// If no data yet, create the data points
			list.map((val, i) =>
			{
				const x = {
					label: dateslist[i].toDateString(),
					date: dateslist[i]
				} as IStackedChartDataPoint;
				x[category] = val;
				return x;
			}).forEach(x => chartdata.push(x));
		} else {
			// Add to the data points
			list.forEach((val, i) => chartdata[i][category] = val);
		}
	});

	// Sort the chart data by categories

	if (categoriesSort) series.sort((a, b) => categoriesSort(a, b));

	// Completed chart data

	console.debug("Chart data:", chartdata);

	// Setup titles

	if (controllerId) {
		const name = Config.controllersList?.filter(x => x.id === controllerId)[0].name ?? controllerId.toString();
		const machineinfo = i18n["labelForMachine"] as string;
		if (machineinfo) title += " - " + machineinfo.replace("{0}", name).replace("{1}", controllerId.toString());
	}

	// Create bar chart

	const chart = am4core.create(Charts.canvasId, am4charts.XYChart);
	chart.data = chartdata;

	AddChartTitles(chart, title || "", timeRange);

	chart.legend = new am4charts.Legend();
	chart.exporting.menu = CreateExportMenu(i18n);

	// X-axis
	const xaxis = chart.xAxes.push(new am4charts.DateAxis());
	xaxis.dataFields.date = "date";
	xaxis.renderer.grid.template.location = 0;
	xaxis.renderer.minGridDistance = 30;
	//xaxis.title.text = i18n["labelDate"] as string;

	if (monthOnly) {
		xaxis.dateFormats.setKey("month", i18n["formatMonth"] as string);
		xaxis.periodChangeDateFormats.setKey("month", `[bold]${i18n["formatYear"] as string}[/]`);
	} else {
		xaxis.dateFormats.setKey("month", i18n["formatMonth"] as string);
		xaxis.periodChangeDateFormats.setKey("month", `[bold]${i18n["formatYear"] as string}[/]`);
		xaxis.dateFormats.setKey("week", i18n["formatShortDate"] as string);
		xaxis.periodChangeDateFormats.setKey("week", `[bold]${i18n["formatShortDate"] as string}[/]`);
		xaxis.dateFormats.setKey("day", i18n["formatShortDate"] as string);
		xaxis.periodChangeDateFormats.setKey("day", `[bold]${i18n["formatShortDate"] as string}[/]`);
		xaxis.periodChangeDateFormats.setKey("hour", `[bold]${i18n["formatShortDate"] as string}[/]`);
	}

	// Y-axis
	const yaxis = chart.yAxes.push(new am4charts.ValueAxis());
	yaxis.min = 0;
	yaxis.max = 100;
	yaxis.strictMinMax = true;
	yaxis.calculateTotals = true;
	yaxis.renderer.minWidth = 50;
	xaxis.renderer.minGridDistance = 80;
	yaxis.title.text = i18n["labelPercentage"] as string;
	yaxis.numberFormatter = new am4core.NumberFormatter();
	yaxis.numberFormatter.numberFormat = "#'%'";

	const tooltipdateformat = i18n[monthOnly ? "formatLongMonth" : "formatLongDate"] + (!monthOnly && hasTime ? " HH:mm" : "");

	series.forEach(category =>
	{
		const ss = chart.series.push(new am4charts.ColumnSeries());
		ss.columns.template.width = am4core.percent(80);
		ss.columns.template.tooltipText = `{dateX.formatDate('${tooltipdateformat}')}\n{name}\n{valueY.totalPercent.formatNumber('#.#')}%`;
		ss.name = formatCategory ? formatCategory(category, i18n) : category;
		ss.dataFields.dateX = "date";
		ss.dataFields.valueY = category;
		ss.dataFields.valueYShow = "totalPercent";
		ss.dataItems.template.locations.categoryX = 0.5;
		ss.stacked = true;
		if (ss.tooltip) {
			ss.tooltip.pointerOrientation = "vertical";
			ss.tooltip.animationDuration = 200;
		}

		const datalabel = ss.bullets.push(new am4charts.LabelBullet());
		datalabel.interactionsEnabled = false;
		datalabel.label.text = "{valueY.totalPercent.formatNumber('#.#')}%";
		datalabel.label.fill = am4core.color("#fff");
		datalabel.locationY = 0.5;
		datalabel.fontSize = 12;

		ss.stroke = am4core.color("#eee");

		if (Charts.colors[category]) {
			const color = Charts.colors[category];
			if (color.fill !== undefined) ss.fill = am4core.color(color.fill);
			if (color.opacity !== undefined) ss.fillOpacity = color.opacity;
			if (color.stroke !== undefined) ss.stroke = am4core.color(color.stroke);
			if (color.text !== undefined) datalabel.label.fill = am4core.color(color.text);
		}
	});

	// Scrollbar

	chart.scrollbarX = new am4core.Scrollbar();
	chart.scrollbarX.parent = chart.bottomAxesContainer;
	chart.scrollbarX.thumb.minWidth = 50;

	return chart;
}
