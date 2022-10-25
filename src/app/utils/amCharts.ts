import { Charts } from "../config";
import { ITranslationDictionary } from "../interfaces";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

export function CreateExportMenu(i18n: ITranslationDictionary)
{
	const exportmenu: am4core.IExportMenuItem[] = [];

	const exportformats = i18n["textChartExportFormats"] as { [format: string]: string; };

	Object.keys(exportformats).forEach(key => exportmenu.push({
		type: key as keyof am4core.IExportOptions,
		label: exportformats[key]
	}));

	const menu = new am4core.ExportMenu();

	menu.items = [{
		"label": i18n["labelExport"] as string,
		"menu": exportmenu
	}];

	return menu;
}

export function AddChartTitles(chart: am4charts.Chart, title: string, subtitle: string)
{
	// Set title

	if (title) {
		const charttitle = chart.titles.create();
		Object.assign(charttitle, Charts.title);
		charttitle.text = title;
	}

	// Set sub-title

	if (subtitle) {
		const container = chart.chartContainer.createChild(am4core.Container);
		container.layout = "absolute";
		container.toBack();
		container.paddingBottom = 15;
		container.width = am4core.percent(100);

		const chartsubtitle = container.createChild(am4core.Label);
		Object.assign(chartsubtitle, Charts.subtitle);
		chartsubtitle.text = subtitle;
		chartsubtitle.align = "center";
	}
}

export function ShowIndicator(chart: am4charts.Chart)
{
	if (!chart.tooltipContainer) return null;

	const indicator = chart.tooltipContainer.createChild(am4core.Container);
	indicator.background.fill = am4core.color("#fff");
	indicator.width = am4core.percent(100);
	indicator.height = am4core.percent(100);

	const loading = indicator.createChild(am4core.Image);
	loading.href = "../images/loading.gif";
	loading.align = "center";
	loading.valign = "middle";
	loading.horizontalCenter = "middle";
	loading.verticalCenter = "middle";
	loading.scale = 2;

	indicator.show();

	return indicator;
}

export function HideIndicator(indicator: am4core.Container)
{
	indicator.hide();
}
