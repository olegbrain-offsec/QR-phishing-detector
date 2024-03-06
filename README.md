# Browser extension for detecting and preventing traffic by phishing QR code for Google Chrome
##  English section
## An extension for the Google Chrome browser that prevents users from clicking on phishing QR codes
The idea of the extension is to give a level of security to users of the Google Chrome browser before scanning potentially malicious QR codes. The browser extension performs a search and then analyzes the link in the QR code. If the text was hidden in the code, it will simply be shown to the user, but if the code contains a link, the extension will make a request to a specialized free API and try to determine where the user will eventually be redirected, whether a short link is used in QR. The VirusTotal API is used to recognize malicious sites, and Redirect Checker is used to detect redirects to prevent potential CORS attacks. This extension was developed as part of the bachelor's work and has many points for improvement, so it has not yet been published in the store and has not been brought to perfection :)
## Requirements before launch
### You are a developer
1. Make sure that your yarn environment is prepared and working as needed, as third-party libraries will be needed when collecting;
2. In case you are an immortal developer or the libraries have disappeared from public access, you can edit the code in the dist location, the collector is not relevant to you then;
3. Before launching and testing, do not forget to specify your VirusTotal token;
4. During the work of the extension, debugging information will be in the debugging console, I recommend using it when analyzing the code;
5. Please note that the algorithm for checking the site for phishing is quite complex and the program has a set threshold of 2 positive responses, which is necessary, since some secure web resources were marked as phishing during debugging.
### You are a user
1. Register for Virus Total and get the API Token according to the instructions in the public domain;
2. Replace the popup in the file.ba0889f8.js in 40083 the value of REPLACE_ME for your token;
3. Go to the browser extension settings, turn on developer mode and point to the "Compiled" folder;
4. After adding, grant permissions to the extension so that it can start working.


# Секция на русском языке
## Расширение для браузера Google Chrome, которое предотвращает переход по фишинговым QR-кодам
Идея расширения заключается в том, чтобы дать уровень безопасности пользователям браузера Google Chrome перед сканированием потенциально вредоносных QR-кодов. Браузерное расширение производит поиск, а затем анализ ссылки в QR-коде. Если в коде был спрятан текст, то он будет просто показан пользователю, если же в коде содержится ссылка, то расширение произведет запрос на специализированный бесплатный API и попробует определить куда будет в конечном итоге переадресован пользователь, используется ли короткая ссылка в QR. Для распознавания вредоносных сайтов используется API VirusTotal, а для предотвращения потенциальных CORS атак для определения переадресации используется Redirect Checker. Данное расширение было разработано в рамках бакалаврской работы и имеет множество моментов для улучшения, поэтому оно до сих пор не опубликовано в магазине и не доведено до идеала:)
## Требования перед запуском
### Вы разработчик
1. Убедитесь, что ваша среда yarn подготовлена и работает как необходимо, так как при сборе нужны будут сторонние либы;
2. На случай, если вы бессмертный разработчик или библиотеки пропали из открытого доступа, Вы можете редактировать код в dist-локации, сборщик Вам тогда не актуален;
3. Перед запуском и тестированием не забудьте указать Ваш VirusTotal токен;
4. В ходе работы расширения отладочная информация будет в консоли отладки, при анализе работы кода рекомендую ее использовать;
5. Учтите, что алгоритм проверки сайта на фишинг является достаточно сложным и программа имеет установленный порог в 2 положительных срабатывания, что является необходимым, так как при отладке некоторые безопасные веб-ресурсы отмечались фишинговыми.
### Вы пользователь
1. Зарегистрируйтесь на Virus Total и получите API Token по инструкции в свободном доступе;
2. Замените в файле popup.ba0889f8.js в 40083 значение REPLACE_ME на ваш токен (использейте поиск по слову);
3. Зайдите в настройки расширений браузера, включите режим разработчика и укажите на папку Compiled;
4. После добавления выдайте разрешения расширению, чтобы оно могло начать свою работу.


# Examples of detection / Примеры обнаружения
Detected phishing sites with or without redirect
![image](https://github.com/olegbrain-offsec/QR_phishing_detector/assets/160741328/1ed4dc58-d716-4adb-a686-5bc407ced7cd)
![image](https://github.com/olegbrain-offsec/QR_phishing_detector/assets/160741328/2fea84e0-e53a-4944-b417-1128f79e17b9)




