import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { Config } from "../config";
import { ITranslationDictionary, ILoggedInUser, IController, IRunReportParameters } from "../interfaces";
import { IAngularMyDpOptions, IMyDayLabels, IMyMonthLabels, IMyDateModel, IMyInputFieldChanged, CalAnimation } from "angular-mydatepicker";

@Component({
	selector: "ichen-report-download",
	templateUrl: "./report.download.component.html"
})
export class ReportDownloadComponent implements OnChanges
{
	@Input() public readonly i18n!: Readonly<ITranslationDictionary>;
	@Input() public currentUser: Readonly<ILoggedInUser> | null = null;
	@Input() public controllersList!: Readonly<IController>[];
	@Input() public title: string | null = null;
	@Input() public disabled = false;
	@Output("run") public readonly runEvent = new EventEmitter<IRunReportParameters>();

	public isError = false;
	public parameters: IRunReportParameters | null = null;
	public get hasValidDateRange() { return !!this.parameters; }
	public dataset = "";
	public selectedController = "";
	public format = "xls";

	private myDrpHasInput = false;
	private myDrpOptions: IAngularMyDpOptions | null = null;
	public myDateModel: IMyDateModel = {
		isRange: true,
		dateRange: {
			beginDate: { year: 0, month: 0, day: 0 },
			endDate: { year: 0, month: 0, day: 0 }
		}
	};
	public get myDateRangePlaceholder()
	{
		return this.i18n["textSelectDateRange"]
	}

	public get myDateRangePickerOptions()
	{
		return this.myDrpOptions || (this.myDrpOptions = {
			dateRange: true,

			//selectorHeight: "2rem",
			//selectorWidth: "350px",

			firstDayOfWeek: "mo",
			minYear: 2016,

			dayLabels: this.i18n["labelWeekDays"] as IMyDayLabels,
			monthLabels: this.i18n["labelMonths"] as IMyMonthLabels,

			calendarAnimation: { in: CalAnimation.ScaleTop, out: CalAnimation.ScaleCenter }
		});
	}

	constructor()
	{
		const fromdate = Config.currentDateRange.fromDate;
		const todate = Config.currentDateRange.toDate;

		this.myDateModel.dateRange = {
			beginDate: { year: fromdate.year, month: fromdate.month, day: fromdate.day },
			endDate: { year: todate.year, month: todate.month, day: todate.day }
		};

		const todate2 = new Date(todate.year, todate.month - 1, todate.day, 0, 0, 0);
		todate2.setDate(todate2.getDate() + 1);

		this.parameters = {
			controllerId: 0,
			dataset: this.dataset,
			format: this.format,
			from: new Date(Date.UTC(fromdate.year, fromdate.month - 1, fromdate.day, 0, 0, 0, 0)).toISOString().substr(0, 10),
			to: new Date(Date.UTC(todate.year, todate.month - 1, todate.day, 0, 0, 0, 0)).toISOString().substr(0, 10),
			lower: new Date(fromdate.year, fromdate.month - 1, fromdate.day, 0, 0, 0, 0).toISOString(),
			upper: todate2.toISOString()
		};
	}

	public ngOnChanges(changes: SimpleChanges)
	{
		// Track changes to invalidate MyDateRangePickerOptions
		if (changes.disabled || changes.i18n) this.myDrpOptions = null;
	}

	public onDateRangeChanged(ev: IMyDateModel)
	{
		console.debug("onDateRangeChanged", ev);

		const fromdate = ev.dateRange?.beginDate;
		const todate = ev.dateRange?.endDate;

		if (ev.isRange && ev.dateRange?.formatted && fromdate && todate) {
			const todate2 = new Date(todate.year, todate.month - 1, todate.day, 0, 0, 0, 0);
			todate2.setDate(todate2.getDate() + 1);

			this.parameters = {
				controllerId: this.selectedController ? parseInt(this.selectedController, 10) : 0,
				dataset: this.dataset,
				format: this.format,
				from: new Date(Date.UTC(fromdate.year, fromdate.month - 1, fromdate.day, 0, 0, 0, 0)).toISOString().substr(0, 10),
				to: new Date(Date.UTC(todate.year, todate.month - 1, todate.day, 0, 0, 0, 0)).toISOString().substr(0, 10),
				lower: new Date(fromdate.year, fromdate.month - 1, fromdate.day, 0, 0, 0, 0).toISOString(),
				upper: todate2.toISOString()
			};

			Config.currentDateRange = {
				fromDate: { year: fromdate.year, month: fromdate.month, day: fromdate.day },
				toDate: { year: fromdate.year, month: fromdate.month, day: fromdate.day }
			};
		} else {
			this.parameters = null;
			Config.currentDateRange = Config.defaultDateRange;
		}
	}

	public onDateRangeInputFieldChanged(ev: IMyInputFieldChanged)
	{
		console.debug("onDateRangeInputFieldChanged", ev);
		if (!ev.valid) {
			// Ignore until the initial value shows up
			if (this.myDrpHasInput) {
				this.parameters = null;
				Config.currentDateRange = Config.defaultDateRange;
			}
		} else {
			this.myDrpHasInput = true;
		}
	}

	public validate()
	{
		if (this.disabled) return false;
		if (!this.hasValidDateRange) return false;
		if (!this.dataset) return false;
		if (!this.selectedController) return false;
		if (!this.format) return false;

		return true;
	}

	public runReport()
	{
		if (!this.validate()) return;
		if (!this.parameters) return;

		this.parameters.controllerId = parseInt(this.selectedController, 10);
		this.parameters.dataset = this.dataset;
		this.parameters.format = this.format;

		console.log(`Run [${this.title}] with parameters:`, this.parameters);

		this.runEvent.emit(this.parameters);
	}
}
