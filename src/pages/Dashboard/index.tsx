import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiMinus } from 'react-icons/fi';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';
import formatDate from '../../utils/formatDate';
import capitalize from '../../utils/capitalize';

interface Transaction {
	id: string;
	title: string;
	value: number;
	formattedValue: string;
	formattedDate: string;
	type: 'income' | 'outcome';
	category: { title: string };
	created_at: Date;
}

interface Balance {
	income: number;
	outcome: number;
	total: number;
}

interface Transactions {
	transactions: Transaction[];
	balance: Balance;
}

interface TableTitle {
	title: string;
	prop: keyof Transaction;
}

const Dashboard: React.FC = () => {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [balance, setBalance] = useState<Balance>({} as Balance);
	const [loadedValues, setLoadedValues] = useState(false);
	const [orderBy, setOrderBy] = useState<keyof Transaction | null>(null);
	const [orderByAsc, setOrderByAsc] = useState(false);

	function orderTable(prop: keyof Transaction): void {
		setOrderBy(prop);
		setOrderByAsc(!orderByAsc);
		if (prop === 'value') {
			transactions.sort((a, b) => {
				const valueA = a.type === 'outcome' ? -a.value : a.value;
				const valueB = b.type === 'outcome' ? -b.value : b.value;
				return orderByAsc ? valueA - valueB : valueB - valueA;
			});
		} else if (prop === 'created_at') {
			transactions.sort((a, b) => {
				const dateA = new Date(a.created_at).getTime();
				const dateB = new Date(b.created_at).getTime();
				return orderByAsc ? dateA - dateB : dateB - dateA;
			});
		} else if (prop === 'title') {
			transactions.sort((a, b) => {
				const titleA = a.title.toUpperCase().charCodeAt(0);
				const titleB = b.title.toUpperCase().charCodeAt(0);
				return orderByAsc ? titleA - titleB : titleB - titleA;
			});
		} else if (prop === 'category') {
			transactions.sort((a, b) => {
				const titleA = a.category.title.toUpperCase().charCodeAt(0);
				const titleB = b.category.title.toUpperCase().charCodeAt(0);
				return orderByAsc ? titleA - titleB : titleB - titleA;
			});
		}
	}

	useEffect(() => {
		api.get<Transactions>('/transactions').then(response => {
			setTransactions(response.data.transactions);
			setBalance(response.data.balance);
			setLoadedValues(true);
		});
	}, []);

	const titles: TableTitle[] = [
		{ title: 'Título', prop: 'title' },
		{ title: 'Preço', prop: 'value' },
		{ title: 'Categoria', prop: 'category' },
		{ title: 'Data', prop: 'created_at' },
	];
	return (
		<>
			<Header />
			<Container>
				<CardContainer>
					<Card>
						<header>
							<p>Entradas</p>
							<img src={income} alt="Income" />
						</header>
						{loadedValues && (
							<h1 data-testid="balance-income">{formatValue(balance.income)}</h1>
						)}
					</Card>
					<Card>
						<header>
							<p>Saídas</p>
							<img src={outcome} alt="Outcome" />
						</header>
						{loadedValues && (
							<h1 data-testid="balance-outcome">{formatValue(balance.outcome)}</h1>
						)}
					</Card>
					<Card total>
						<header>
							<p>Total</p>
							<img src={total} alt="Total" />
						</header>
						{loadedValues && (
							<h1 data-testid="balance-total">{formatValue(balance.total)}</h1>
						)}
					</Card>
				</CardContainer>

				<TableContainer>
					<table>
						<thead>
							<tr>
								{titles.map((title, index) => {
									let Icon = <FiMinus />;

									if (title.prop === orderBy) {
										if (!orderByAsc) {
											Icon = <FiChevronUp style={{ color: '#FF872C' }} />;
										} else {
											Icon = <FiChevronDown style={{ color: '#FF872C' }} />;
										}
									}

									return (
										<th
											key={String(index)}
											onClick={() => {
												orderTable(title.prop);
											}}
										>
											{title.title}
											{Icon}
										</th>
									);
								})}
							</tr>
						</thead>

						<tbody>
							{transactions.map((transaction: Transaction) => (
								<tr key={transaction.id}>
									<td className="title">{transaction.title}</td>
									<td className={transaction.type}>
										{transaction.type === 'outcome' && '- '}
										{formatValue(transaction.value)}
									</td>
									<td>{capitalize(transaction.category.title)}</td>
									<td>{formatDate(new Date(transaction.created_at))}</td>
								</tr>
							))}
						</tbody>
					</table>
				</TableContainer>
			</Container>
		</>
	);
};

export default Dashboard;
