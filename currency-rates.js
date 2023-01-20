const config = input.config({
    title: 'Currency table',
    description: 'A script that lets you keep and update a Currencies table. Create an empty table with (at least) Name and Rate fields. Add a currency per row for each currency you need (add to the Name Field or any other you pick in the extension settings) field (3-digit code, e.g.: USD, AUD, GBP).  The script will fetch the rates and fill-in the Rate (see extension settings) field. You can update manually by running this script or set it on a schedule.',
    items: [
        input.config.table('currenciesTable', {
            label: 'Currencies table',
            description: 'The table in which you track currency rates'
        }),
        input.config.field('currencyField', {
            label: 'Currency field',
            description: 'The field where you add the currencies (You may use the "Name" field)',
            parentTable: 'currenciesTable',
        }),
        input.config.field('rateField', {
            label: 'Rate field',
            description: 'The rate field that will be updated by this script',
            parentTable: 'currenciesTable',
        }),
    ]
});

const currenciesTable = config.currenciesTable;
const table = base.getTable('Currencies');

const apiResponse = await fetch('https://api.exchangerate.host/latest?base=USD');
const data = await apiResponse.json();
output.text('Fetched rates from api');
output.table(data.rates);

const myCurrencies = await table.selectRecordsAsync({ fields: [config.currencyField] });

for (let record of myCurrencies.records) {
    let currency = record.getCellValue(config.currencyField);
    if (currency !== null) {
        await table.updateRecordAsync(record, {
            [config.rateField.name]: data.rates[currency]
        });
    }
}
