import { ITimeRangeValues, IDataValue } from "../interfaces";

export default function(data: ITimeRangeValues[])
{
	const categories = new Map<string, IDataValue[]>();

	data.forEach(item => Object.keys(item.data).forEach(category => categories.set(category, [])));

	data.forEach(item => categories.forEach((list, category) =>
	{
		const value = item.data[category];
		list.push(value === undefined || Math.abs(value) < 0.01 ? undefined : value);
	}));

	console.debug("Categories:", categories);

	return categories;
}
