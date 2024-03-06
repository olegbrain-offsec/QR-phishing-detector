/* ИМПОРТ ФУНКЦИЙ ИЗ БИБЛИОТЕК REACT, REACT-DOM, ZXING */
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserQRCodeReader } from '@zxing/library'

/* РЕГУЛЯРНОЕ ВЫРАЖЕНИЕ ДЛЯ ВЫДЕЛЕНИЯ HTTP-ССЫЛКИ (НА ОСНОВЕ ANDROID LINKIFY) */
var validURL = /(?:(http|https):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.+((\w|\.)*)|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])(\.|.)(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)(\.))(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)(\.)(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/i;

/* ЗАПУСК ПРОГРАММЫ */
const Reader = () => {
	// Установка состояния начальных переменных
  	const [text, set] = useState('QR-код не найден!')
	// Считывание QR-кода, захваченного Chrome Tabs API
    const read = (dataUrl) => {
    	const codeReader = new BrowserQRCodeReader()
		// Promise на декодированный текст
    	codeReader.decodeFromImage(undefined, dataUrl)
      		.then(result => set(result.text))
      		.catch((err) => {})
  	}
	// Захват содержимого страницы с помощью API Chrome Tabs
  	useEffect(() => {
    	chrome.tabs.captureVisibleTab(undefined, { format: 'jpeg' }, read)
  	}, [])
	// Возврат HTML-кода после обработки QR-кода
	return returnTextURL(text);
}

/* Рендеринг страницы по результатам проверки QR-кода */
ReactDOM.render(<Reader/>,document.getElementById('AntiPhishingQR'),);

/* ФУНКЦИИ РАСШИРЕНИЯ */

// Проверка на безопасность проткола
function checkHTTP(insecuvalidURL){
	// Протокол HTTP, но не HTTPS?
	if ((/http(?!s)/i).test(insecuvalidURL)){
		return true;
	}
	// Протокол HTTPS
	else {
		return false;
	}
}

// Проверка на переадресацию
async function getRedirectDest(UrlToCheck){
	// Возвращам fetch, выполняя обработку респонса
    return fetch(UrlToCheck)
    .then((response) => response.json())
    .then((responseData) => {
		var responseDataSpace = responseData['data'];
		// Берем последний элемент из списка переадресаций
		var indexLastRedir = responseDataSpace.length - 1;
		// Получаем конечный URL, в нем всегда будет принудительно установлен протокол HTTPS
		var lastRedir = responseDataSpace[indexLastRedir]['request']['info']['curl']['CURLOPT_URL'];
		console.log("Результат переадресации, принудительно установлен HTTPS: " + lastRedir)
		// Возвращаем конечный URL с принудительным HTTPS запросом
		return lastRedir;
    });
  }

// Проверка на фишинг VirusTotal
async function getPhishResult(link) {
	// Возвращам fetch, для доступа к API используем ключ
	return fetch(link,{
		url: link,
	  	headers: {
			accept: 'application/json',
			'x-apikey': 'REPLACE_ME',
	  	}
	})
	.then(response => {
		// Если ответ не нормальный - URL не найден
		if (!response.ok){
			console.log('Ресурса нет в б/д');
			return 'not-found'
		} else {
			// Ответ ОК - возврат JSON
			return response.json()
		}
	})
}

// Функция обработки сссылок и возврата элементов рендеринга HTML-кода
function returnTextURL(text){
	// Печать текста в консоль
	console.log("Текст: " + text);
	// Есть ли ссылка в QR-коде
	if (validURL.test(text)){
		// Используется небезопасный протокол HTTP?
		if (checkHTTP(text)){
			// Найден небезопасный протокол http
			console.log("Найден небезопасный протокол http");
			return (<div>
						<h2 className="text-style danger">НЕБЕЗОПАСНЫЙ ПРОТОКОЛ</h2>
						<h2 className="text-style">Данный QR-код является опасным, не сканируйте его и не переходе по полученной сслыке!</h2>
					</div>);
		}
		// Проверка на коротку ссылку
			// Создание объекта URL из исходного текста и присвоение ему ссылки
		var originalURL = new URL(text);
		console.log("Исходная ссылка: " + originalURL);
		var originalHostname = originalURL.hostname;
		console.log("Домен исходной ссылки: " + originalHostname);
		// Определение запроса URL для получения данных о переадресации
		const UrlToCheck = 'https://api.redirect-checker.net/?url='+ encodeURI(text)+'&timeout=5&maxhops=20&meta-refresh=1&format=json&more=1'
		// Запрос к API для проверки на переадресацию
		getRedirectDest(UrlToCheck).then(response => {
			var newURL = new URL(response);
			var newHostname = newURL.hostname;
			var newRequestURL = newURL.protocol + '//' + newURL.hostname + '/';
			console.log("Конечная ссылка: " +newRequestURL);
			console.log("Конечный домен: " +newHostname);
			// Переадресация на сайт с безопасным протоколом или нет переадресации
			console.log("Домены совпадают, не совпадают, но не найден опасный протокол");
			const encodedParams = btoa(newURL).replace(/=/g, '');
			var linkToRequest = 'https://www.virustotal.com/api/v3/urls/'+encodedParams;
			console.log("Запрос отправлен: (API Link + base64 w/o padding): " + linkToRequest);
			getPhishResult(linkToRequest).then(response => {
				// console.log("Результат, полученный от VT (not-found означает, что страница не найдена, т.е. URL в базе отсутсвует)")
				// Найден редирект, QR в базе нет
				if ((response=='not-found')&&(newHostname!=originalHostname)) {
					console.log("Сайт не найден в б/д VT, но имеет переадресацию");
					ReactDOM.render(<div>
										<h2 className="text-style danger">ДАННЫЙ QR-КОД НЕ БЫЛ ПРОВЕРЕН НА ФИШИНГ, НО ИМЕЕТ ПЕРЕАДРЕСАЦИЮ!</h2>
										<h2 className="text-style">Данный QR-код ведет с сайта {originalHostname} на {newHostname}, который не был проверен, перед переходом ознакомьтесь с информацией о конечном сайте!</h2>
									</div>,document.getElementById('AntiPhishingQR',));
				} 
				// Нет редиректа и QR нет в базе
				if ((response=='not-found')&&(newHostname==originalHostname)){
					console.log("Сайт не найден в б/д VT, но не имеет переадресацию");
					ReactDOM.render (<div>
										<h2 className="text-style">QR-код не найден в б/д, но прошел все проверки!</h2>
										<h2 className="text-style">Ссылка: {text}</h2><button className="button" type='button' onClick={() => window.open(text)}>Перейти по ссылке</button>
									</div>,document.getElementById('AntiPhishingQR',));
				}
				// QR есть в базе
				if (response!='not-found') {
					console.log("Сайт найден в б/д VT");
					// Извлечение из JSON результатов анализа
					var afterAnalysis = response['data']['attributes']['last_analysis_stats']
					// Исследуем две категории - опасный и подозрительный сайт
					var curr_mal = afterAnalysis['malicious'];
					var curr_susp = afterAnalysis['suspicious'];
					// Результат - количество отметок сайта как подозрительного и опасного
					var resultCheck = curr_mal + curr_susp;
					// Если таких отметок больше 2-х считаем ссылку опасной
					if (resultCheck>2){
						console.log("Сайт отмечен как опасный больше 2 раз");
						// Домены не совпадают - переадресация на опасный сайт
						if (newHostname!=originalHostname) {
							console.log("Ссылка не имеет переадресации");
							ReactDOM.render(<div>
												<h2 className="text-style danger">ДАННЫЙ QR-КОД СОДЕРЖИТ ПЕРЕАДРЕСАЦИЮ НА ФИШИНГОВЫЙ САЙТ</h2>
												<h2 className="text-style">Данный QR-код ведет с сайта {originalHostname} на {newHostname}, который отмечен опасным {curr_mal} раз и подозрительным {curr_susp} раз, не сканируйте его и не переходе по полученной сслыке!</h2>
											</div>,document.getElementById('AntiPhishingQR',));
						} 
						// Переадресации нет, но сайт фишинговый
						else {
							console.log("Ссылка не имеет переадресации");
							ReactDOM.render(<div>
												<h2 className="text-style danger">ДАННЫЙ QR-КОД ЯВЛЯЕТСЯ ФИШИНГОВЫМ</h2>
												<h2 className="text-style">Данный QR-код отмечен опасным {curr_mal} раз и подозрительным {curr_susp} раз, не сканируйте его и не переходе по полученной сслыке!</h2>
											</div>,document.getElementById('AntiPhishingQR',));
						}
					} 
					// Сайт есть в базе и он не фишинговый
					else {
						// Переадресация есть, ведет на безопасный сайт
						if (newHostname!=originalHostname) {
							console.log("Переадресация есть, но ведет на безопасный сайт");
							ReactDOM.render (<div>
												<h2 className="text-style">QR-код прошел все проверки, но содержит переадресацию!</h2>
												<h2 className="text-style">Ссылка: {text} Переадресация на: {newHostname} </h2><button className="button" type='button' onClick={() => window.open(text)}>Перейти по ссылке</button>
											</div>,document.getElementById('AntiPhishingQR',));
						} 
						// Переадресации нет, сайт полностью проверен
						else {
							console.log("QR полностью безопасен!");
							ReactDOM.render (<div>
												<h2 className="text-style">QR-код прошел все проверки!</h2>
												<h2 className="text-style">Ссылка: {text} </h2><button className="button" type='button' onClick={() => window.open(text)}>Перейти по ссылке</button>
											</div>,document.getElementById('AntiPhishingQR',));
						}
					}
				}
			})
		});
		// Пишем, что анализируем QR
		return (<div id="secure"><h2 className="text-style">Производится анализ QR-кода...</h2></div>);
	}
	// Ссылки нет, в QR содержится просто текст или он вовсе не найден
	else {
		// QR не найден
		if (text=='QR-код не найден!'){
			return (<div><h2 className="text-style">QR-код не найден!</h2></div>);
		} 
		// В QR просто текст
		else {
			return (<div>
						<h2 className="text-style">QR-код содержит только текст:</h2>
						<h2 className="text-style text-qr">{text}</h2>
					</div>);
		}
	}
}



/* ЭТОТ ТЕКСТ МОЖНО ВЕСЬ УДАЛИТЬ, ЭТО НУЖНО МНЕ ДЛЯ СОСТАВЛЕНИЯ ТЕСТОВ
	ТЕСТЫ: 
			1. QR С ССЫЛКОЙ НА HTTP-САЙТ
				САЙТ: http://marinaberdichevskaya.ru/
			2. QR С ПЕРЕАДРЕСАЦИЕЙ И УСТАНОВЛЕННЫМ HTTP
				САЙТ: http://marinaberdichevskaya.ru/ 
				ССЫЛКА С ПЕРЕАДРЕСАЦИЕЙ: 
			3. QR С ПЕРЕАДРЕСАЦИЕЙ НА САЙТ, КОТОРОГО НЕТ В БАЗЕ ДАННЫХ
				САЙТ: https://marinaberdichevskaya.ru/
				ССЫЛКА С ПЕРЕАДРЕСАЦИЕЙ: 
			4. QR НА САЙТ, КОТОРОГО НЕТ В БАЗЕ ДАННЫХ И НЕТ ПЕРЕАДРЕСАЦИИ
				САЙТ: https://marinaberdichevskaya.ru/ 
			5. QR С ПЕРЕАДРЕСАЦИЕЙ НА ФИШИНГОВЫЙ САЙТ
				САЙТ: https://myetherevvalliet.com/
				ССЫЛКА С ПЕРЕАДРЕСАЦИЕЙ: 
			6. QR БЕЗ ПЕРЕАДРЕСАЦИИ НА ФИШИНГОВЫЙ САЙТ
				САЙТ: https://myetherevvalliet.com/

			7. QR С ПЕРЕАДРЕСАЦИЕЙ НА БЕЗОПАСНЫЙ САЙТ
				САЙТ: https://www.google.com 
				ССЫЛКА С ПЕРЕАДРЕСАЦИЕЙ: 
			8. QR ВЕДЕТ НА БЕЗОПАСНЫЙ САЙТ
				САЙТ: https://www.google.com 
			9. QR НЕ НАЙДЕН
				-
			10. QR СОДЕРЖИТ ТОЛЬКО ТЕКСТ
				ТЕКСТ: Дипломную работу выполнила Бердичевская Марина М4О-411Б-19
*/ 