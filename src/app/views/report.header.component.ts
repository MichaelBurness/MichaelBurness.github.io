import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { Config } from "../config";
import { ITranslationDictionary, IController, IRunReportParameters } from "../interfaces";
import { IAngularMyDpOptions, IMyDayLabels, IMyMonthLabels, IMyDateModel, IMyInputFieldChanged, CalAnimation } from "angular-mydatepicker";

@Component({
	selector: "ichen-report-header",
	templateUrl: "./report.header.component.html"
})
export class ReportHeaderComponent implements OnChanges
{
	@Input() public readonly i18n!: Readonly<ITranslationDictionary>;
	@Input() public title: string | null = null;
	@Input() public disabled = false;
	@Input() public useDateRange = true;
	@Input() public collapsed = false;
	@Input() public controllersList!: Readonly<IController>[];
	@Output("run") public readonly runEvent = new EventEmitter<IRunReportParameters>();

	public readonly byMachineStep = "*";
	public readonly byShiftStep = Config.shiftStep;
	public parameters: IRunReportParameters | null = null;
	public get hasValidDateRange() { return !!this.parameters; }
	public step = "00:00:00";
	public selectedController = "0";

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
			controllerId: parseInt(this.selectedController, 10),
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

		// Track changes to the list of controllers
		const change = changes["controllersList"];

		if (change?.currentValue?.length === 1) {
			console.debug(`Length of controllers list has changed to 1. Choosing controller ${change.currentValue[0].id} by default.`);
			if (this.step === this.byMachineStep) this.step = "00:00:00";
			if (this.selectedController === "0") this.selectedController = change.currentValue[0].id;
		}
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
				controllerId: parseInt(this.selectedController, 10),
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

		if (this.step === this.byMachineStep && this.selectedController !== "0") return false;

		// Do not limit
		//if (this.step) {
		//	switch (this.step) {
		//		case "01:00:00": {
		//			if (this.parameters.from !== this.parameters.to) return false;
		//			break;
		//		}
		//		case this.byShiftStep: {
		//			// Check date range
		//			const from = new Date(this.parameters.from);
		//			const to = new Date(this.parameters.to);
		//			const diff = to.valueOf() - from.valueOf();
		//			const days = diff / (1000 * 60 * 60 * 24) + 1;

		//			if (days > 7) return false;
		//			break;
		//		}
		//	}
		//}

		return true;
	}

	public runReport()
	{
		if (!this.validate()) return;
		if (!this.parameters) return;

		this.parameters.controllerId = parseInt(this.selectedController, 10);

		if (this.step === this.byMachineStep) {
			delete this.parameters.step;
			this.parameters.byMachine = true;
		} else if (this.step !== "00:00:00") {
			this.parameters.step = this.step;
			delete this.parameters.byMachine;
		} else {
			delete this.parameters.step;
			delete this.parameters.byMachine;
		}

		switch (this.step) {
			case "-30:00:00:00":
			case "-90:00:00:00":
			case "-180:00:00:00": {
				this.parameters.monthOnly = true;
				break;
			}
			default: {
				delete this.parameters.monthOnly;
				break;
			}
		}

		console.log(`Run [${this.title}] with parameters:`, this.parameters);

		this.runEvent.emit(this.parameters);
	}
}
