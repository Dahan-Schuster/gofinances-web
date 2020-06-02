const formatDate = (date: Date): string =>
	Intl.DateTimeFormat('pt-br').format(date);

export default formatDate;
