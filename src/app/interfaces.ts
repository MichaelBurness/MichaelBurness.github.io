export type ITranslationDictionary = Readonly<{ [id: string]: string | { [key: string]: string; }; }>;

export interface ILoggedInUser
{
	id: number;
	isEnabled: boolean;
	name: string;
	password: string;
	filters?: string;
	roles: string[];
	sessionId: string;
	started: string | Date;
	lastAccessed: string | Date;
	created: string | Date;
	modified?: string | Date;
}

export type ControllerTypes = "Ai01" | "Ai02" | "Ai11" | "Ai12" | "CPC60" | "MPC60" | "CDC2000" | "CDC3000" | "CDC2000WIN" | "SPS3300" | "NewAge" | "CBmold300" | "CBmold800" | "Unknown";

export interface IController
{
	id: number;
	name: string;
	isEnabled: boolean;
	type?: ControllerTypes;
	version?: string;
	model?: string;
	IP?: string;
	created: string | Date;
	modified?: string | Date;
}

export interface IDate
{
	year: number;
	month: number;
	day: number;
}

export interface IDateRange
{
	fromDate: IDate;
	toDate: IDate;
}

export interface ITimeRangeValues
{
	startTime: string;
	endTime: string;
	data: { [key: string]: number; }
}

export interface IControllerIDandName
{
	controllerId: number;
	name: string;
}

export interface ITimeRangeValuesByControllers
{
	[controllerId: string]: (ITimeRangeValues & IControllerIDandName)[];
}

export interface IRunReportParameters
{
	from: string;
	to: string;
	lower: string;
	upper: string;
	controllerId: number;
	dataset?: string;
	step?: string;
	byMachine?: boolean;
	monthOnly?: boolean;
	format?: string;
}

export interface IDrawFormat
{
	fill?: string;
	opacity?: number;
	stroke?: string;
	text?: string;
}

export type IDataValue = number | undefined;

export interface IDataPoint
{
	label: string;
	date?: Date;
}

export interface IPieChartDataPoint extends IDataPoint, IDrawFormat
{
	value: IDataValue;
	displayValue?: string;
	isSliced?: number;
	tooltext?: string;
}

export interface ICategoryValues
{
	[category: string]: IDataValue;
}

export type IStackedChartDataPoint = IDataPoint & ICategoryValues;
