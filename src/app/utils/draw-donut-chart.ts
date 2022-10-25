import { Config, Charts } from "../config";
import { ITimeRangeValues, ITranslationDictionary, IPieChartDataPoint } from "../interfaces";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { CreateExportMenu, AddChartTitles, ShowIndicator, HideIndicator } from "../utils/amCharts";

export function DrawDonutChart(
	title: string | null,
	controllerId: number,
	timeRange: string,
	data: ITimeRangeValues,
	i18n: ITranslationDictionary,
	categoriesSort: ((a: string, b: string) => number) | null,
	formatCategory: ((category: string, i18n: ITranslationDictionary) => string) | null
)
{
	if (!data) throw new Error("DrawDonutChart: data is null!");

	// Build chart series

	const chartdata: IPieChartDataPoint[] = [];

	Object.keys(data.data).forEach(label =>
	{
		const value = data.data[label];
		if (value !== 0 && Math.abs(value) > 0.001) chartdata.push({ label: label, value: value });
	});

	// Sort the categories

	if (categoriesSort) chartdata.sort((a, b) => categoriesSort(a.label || "", b.label || ""));

	// Slice format

	let customfill = false;

	chartdata.forEach(category =>
	{
		if (!category.label) return;
		if (Charts.colors[category.label]) {
			const color = Charts.colors[category.label];

			// This is supposed to require amcore.Color, but it seems that strings work just fine
			if (color.fill) category.fill = color.fill;
			if (color.opacity !== undefined) category.opacity = color.opacity;
			if (color.stroke) category.stroke = color.stroke;
			if (color.text) category.text = color.text;

			customfill = true;
		}
	});

	// Process the category names

	if (formatCategory) chartdata.forEach(category => category.label = (category.label && formatCategory(category.label, i18n)) || category.label);

	// Completed chart data

	console.debug("Chart data:", chartdata);

	// Setup titles

	if (controllerId) {
		const name = Config.controllersList?.filter(x => x.id === controllerId)[0].name ?? controllerId.toString();
		const subcaption = i18n["labelForMachine"] as string;
		if (subcaption) title += " - " + subcaption.replace("{0}", name).replace("{1}", controllerId.toString());
	}

	// Create donut chart

	const chart = am4core.create(Charts.canvasId, am4charts.PieChart);
	chart.data = chartdata;

	AddChartTitles(chart, title || "", timeRange);

	chart.innerRadius = am4core.percent(45);
	chart.legend = new am4charts.Legend();
	chart.exporting.menu = CreateExportMenu(i18n);

	const pieSeries = chart.series.push(new am4charts.PieSeries());
	pieSeries.dataFields.value = "value";
	pieSeries.dataFields.category = "label";

	// This creates initial animation
	pieSeries.hiddenState.properties.opacity = 1;
	pieSeries.hiddenState.properties.endAngle = -90;
	pieSeries.hiddenState.properties.startAngle = -90;

	// Formatting
	if (!customfill) {
		pieSeries.slices.template.stroke = am4core.color("#fff");
		pieSeries.slices.template.strokeWidth = 2;
		pieSeries.slices.template.strokeOpacity = 1;
	} else {
		pieSeries.slices.template.stroke = am4core.color("#aaa");
		pieSeries.slices.template.strokeWidth = 1;
		pieSeries.slices.template.strokeOpacity = 1;

		pieSeries.slices.template.propertyFields.fill = "fill";
		// pieSeries.slices.template.propertyFields.stroke = "stroke";
		pieSeries.slices.template.propertyFields.fillOpacity = "opacity";
		//pieSeries.labels.template.propertyFields.fill = "text";
	}

	if (pieSeries.tooltip) pieSeries.tooltip.animationDuration = 200;

	pieSeries.slices.template.tooltipText = "{category}\n{value.percent.formatNumber('#.#')}%";
	pieSeries.labels.template.text = "{category} ({value.percent.formatNumber('#.#')}%)";
	chart.legend.valueLabels.template.text = "{value.percent.formatNumber('#.#')}%";

	return chart;
}
