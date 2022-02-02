const TILE_ROTATE_TIME = 2;
const ALLOWED_KEYS = ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г',
											'Ш', 'Щ', 'З', 'Х', 'Ї', 'Ф', 'І', 
											'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 
											'Ж', 'Є', 'Я', 'Ч', 'С', 'М', 'И',
											'Т', 'Ь', 'Б', 'Ю', 'BACKSPACE', 'ENTER'];
let board = null;
let keyboard = null;
let entered_words = null;
let line_in_board = null;
let column_in_board = null;
let user_word = null;
let hidden_word = null;

let end_game = false;
let lock_buttons = false;
let game_loaded_from_url = false;

set_value_variables_defoult();

document.getElementById('open-params').onclick = () => {
	show_params();
}

document.getElementById('params-overlay').onclick = () => {
	hide_params();
}

document.getElementById('manual-button').onclick = () => {
	document.getElementById('manual').style.display = 'block';
	hide_params();
}

document.getElementById('hide-manual-button').onclick = () => {
	document.getElementById('manual').style.display = 'none';
}

document.getElementById('share-button').onclick = () => {
	document.getElementById('share-button').blur();
	
	let number_entered_words = entered_words.length;

	if (number_entered_words != 0){
		if (number_entered_words === 1 && end_game === true) {
			toast('Ви не можете скопіювати посилання на вашу загадку, тому що ви вгадали таємне слово з першого ходу.')
		} else if (number_entered_words === 1){
			navigator.clipboard.writeText(get_url_from_game_state());
			toast('Посилання на вашу загадку скопійовано в буфер обміну!');
		} else {
			if (end_game){
				number_entered_words--;
			}

			document.getElementById('number_strings').min = '1';
			document.getElementById('number_strings').max = String(number_entered_words);
			document.getElementById('number_strings').value = String(number_entered_words);
			document.querySelector('.modal-open').checked = true;
			document.getElementById('copy-button').focus();
			lock_buttons = true;
		}
	} else {
		toast('Щоб скопіювати посилання, почніть відгадувати таємне слово.');
	}
}

document.getElementById('copy-button').onclick = () => {
	let number_strings = document.getElementById('number_strings').value;
	let number_entered_words = entered_words.length;

	if (end_game){
		number_entered_words--;
	}

	if (number_strings != ''){
		if (Number(number_strings) >= 1 && Number(number_strings) <= number_entered_words){
			navigator.clipboard.writeText(get_url_from_game_state(number_strings=number_strings));
			document.querySelector('.modal-open').checked = false;
			lock_buttons = false;
			toast('Посилання на вашу загадку скопійовано в буфер обміну!');
		}
	}
}

document.querySelectorAll('.button-keyboard').forEach(function(button) {
	button.onclick = () => {
		button.blur();
		button_clicked(button.dataset.letter);
	}
});

document.addEventListener('keydown', (event) => {
	if (lock_buttons)
		return

	if (end_game){
		end_game = false;
		reset_game();
	} else {
		key = event.key.toUpperCase();
			if(ALLOWED_KEYS.indexOf(key) != -1)
				button_clicked(key);
	}
});

document.querySelectorAll('.tile').forEach((tile) => {
	tile.onclick = () => {
		let tile_id = tile.id.replace('tile-', '').split('-');
		let state_tile = board[tile_id[0]][tile_id[1]];
		let letter = tile.innerHTML;

		if (state_tile != 0){
			switch (state_tile){
				case 1:
					toast(`У таємному слові нема букви "${letter.toUpperCase()}".`);
					break;
				case 2:
					toast(`Буква "${letter.toUpperCase()}" є у таємному слові, але не на цій позиції.`);
					break;
				case 3:
					toast(`Буква "${letter.toUpperCase()}" є у таємному слові, і стоїть на вірній позиції.`);
					break;
			}
		}
	}
});

function show_params(){
	document.getElementById('params-panel').style.display = 'block';
	document.getElementById('params-overlay').style.display = 'block';
	document.getElementById('open-params').style.display = 'none';
}

function hide_params(){
	document.getElementById('params-panel').style.display = 'none';
	document.getElementById('params-overlay').style.display = 'none';
	document.getElementById('open-params').style.display = 'block';
}

function set_value_variables_defoult(){
	line_in_board = 0;
	column_in_board = 0;
	user_word = [];
	board = [[0, 0, 0, 0, 0],
					 [0, 0, 0, 0, 0],
					 [0, 0, 0, 0, 0],
					 [0, 0, 0, 0, 0],
					 [0, 0, 0, 0, 0],
				   [0, 0, 0, 0, 0]
					];
	keyboard = {'Й':0, 'Ц':0, 'У':0, 'К':0, 'Е':0, 'Н':0, 'Г':0, 'Ш':0, 'Щ':0, 'З':0, 'Х':0,
							'Ї':0, 'Ф':0, 'І':0, 'В':0, 'А':0, 'П':0, 'Р':0, 'О':0, 'Л':0, 'Д':0, 'Ж':0, 
							'Є':0, 'Я':0, 'Ч':0, 'С':0, 'М':0, 'И':0, 'Т':0, 'Ь':0, 'Б':0, 'Ю':0};
	entered_words = [];
	hidden_word = '';
}

function button_clicked(letter){
	if (lock_buttons || letter === undefined)
		return;
	
	if (end_game){
		end_game = false;
		reset_game();
		return;
	}

	if (letter.toUpperCase() === 'ENTER'){
		word_entered();
	} else if (letter.toUpperCase() === 'BACKSPACE'){		
		backspace_pressed();
	} else if (column_in_board < 5){
		document.getElementById(`tile-${line_in_board}-${column_in_board}`).innerHTML = letter;
		user_word.push(letter.toLowerCase());
		column_in_board++;
	}
}

function backspace_pressed() {
	if (column_in_board > 0){	
		user_word = user_word.slice(0, -1);
		
		column_in_board--;
		document.getElementById(`tile-${line_in_board}-${column_in_board}`).innerHTML = '';
	}
}

function word_entered() {
	if (column_in_board === 5) {
		if(check_user_word()){
			entered_words.push(user_word);
			let number_of_coincidences = word_match_count();
			
			if (number_of_coincidences === 5){
				toast('Ви вгадали!');
				clear_save_game();
				end_game = true;
			} else {
				if (line_in_board != 5){
					line_in_board++;
					column_in_board = 0;
					user_word = [];
					save_game();
				} else {
					toast(`Ви програли. Таємне слово: ${hidden_word.join('')}.`);
					clear_save_game();
					end_game = true;
				}
			}
		} else {
			toast('Я не знаю цього слова.');
		}
	} else {
		toast('Слово має бути з 5 літер.');
	}
}

function toast(message){
	new Toast({
		title: false,
		text: message,
		theme: 'light',
		autohide: true,
		interval: 3000
	});	
}

function word_match_count() {
	let old_hidden_word = JSON.parse(JSON.stringify(hidden_word));
	let number_of_coincidences = 0;
	let count_yellow;
	let color;

	// Match green letter 
	for(let i = 0; i < hidden_word.length; i++){
		if(user_word[i] === hidden_word[i]){
			set_color_tile(line_in_board, i, 'green');
			set_color_button(user_word[i], 'green');
			hidden_word[i] = '0';
			number_of_coincidences++;
		} 
	}

	// Match yellow and gray letter
	for(let i = 0; i < hidden_word.length; i++){
		count_yellow = count_yellow_letter(user_word[i], hidden_word);

		if (count_yellow.length > 0) {
			if (get_color_tile(line_in_board, i) != 'green'){
				hidden_word[count_yellow[0]] = '0';
				set_color_tile(line_in_board, i, 'yellow');
				
				if (get_color_button(user_word[i]) != 'green')
					set_color_button(user_word[i], 'yellow');
			}
		} else {
			if (get_color_tile(line_in_board, i) != 'green'){
				set_color_tile(line_in_board, i, 'gray');

				color = get_color_button(user_word[i]);
				
				if ((color != 'green') && (color != 'yellow'))
					set_color_button(user_word[i], 'gray');
			}
		}
	}
	
	sync_board();
	sync_keyboard();
	hidden_word = old_hidden_word;
	return number_of_coincidences;
}

function count_yellow_letter(letter, word){
	let index_list = [];
	letter = letter.toLowerCase();

	for(let i = 0; i < word.length; i++){
		if (word[i] === letter)
			index_list.push(i);
	}

	return index_list;
}

function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

function make_a_word(){	
	while (true){
		hidden_word = words[randomInteger(0, words.length-1)];

		if (hidden_word[0] === '-' && hidden_word.length === 6){
			hidden_word = hidden_word.slice(1);
			break;
		} else {
			continue;
		}
	}

	hidden_word = hidden_word.split('')
}

function check_user_word(word) {
	if ((words.indexOf(user_word.join('').toLowerCase()) != -1) || (words.indexOf('-' + user_word.join('').toLowerCase()) != -1)){
		return true;
	} else {
		return false;
	}
}

function reset_game() {
	if (game_loaded_from_url === true){
		window.location.href = window.location.href.replace(window.location.search, '');
		return;
	}

	document.querySelectorAll('.button-keyboard').forEach((button) => {
		reset_color_button(button);
		button.classList.add('white-button-keyboard');
	});

	document.querySelectorAll('.tile').forEach((tile) => {
		setTimeout(() => {reset_color_tile(tile); tile.classList.add('white-tile'); tile.innerHTML = '';}, 1000)
		rotate_tile(tile);
	});

	set_value_variables_defoult();
	make_a_word();
}

function rotate_tile(tile){
	lock_buttons = true;
	tile.style.transition = `transform ${TILE_ROTATE_TIME}s linear`;

	tile.style.transform = 'rotate3d(1, 0, 0, 180deg)';
	
	setTimeout(() => {
		tile.style.transition = 'transform 0s linear';
		tile.style.transform = 'rotate(360deg)';
		lock_buttons = false;
	}, 2000);
}

function set_color_tile(tile_row, tile_column, color) {
	switch (color){
		case 'white': 
			color = 0;
			break;
		case 'gray':
			color = 1;
			break;
		case 'yellow':
			color = 2;
			break;		
		case 'green':
			color = 3;
			break;
	}


	board[tile_row][tile_column] = color;
}

function get_color_tile(tile_row, tile_column) {
	color =  board[tile_row][tile_column];

	switch (color){
		case 0:
			color = 'white';
			break;
		case 1:
			color = 'gray';
			break;
		case 2:
			color = 'yellow';
			break;		
		case 3:
			color = 'green';
			break;
	}

	return color;
}

function reset_color_tile(tile) {
	tile.classList.remove('white-tile');
	tile.classList.remove('gray-tile');
	tile.classList.remove('yellow-tile');
	tile.classList.remove('green-tile');
}

function sync_board(){
	let tile = null;

	for (let i = 0; i < board.length; i++){
		for (let j = 0; j < board[i].length; j++){
			tile = document.getElementById(`tile-${i}-${j}`)
			reset_color_tile(tile);

			switch (board[i][j]){
				case 0: 
					tile.classList.add('white-tile');
					break;
				case 1:
					tile.classList.add('gray-tile');
					break;
				case 2:
					tile.classList.add('yellow-tile');
					break;
				case 3:
					tile.classList.add('green-tile');
					break;
			}
		}
	}
}

function set_color_button(letter, color) {
	switch (color){
		case 'white': 
			color = 0;
			break;
		case 'gray':
			color = 1;
			break;
		case 'yellow':
			color = 2;
			break;		
		case 'green':
			color = 3;
			break;
	}

	keyboard[letter.toUpperCase()] = color;
}

function get_color_button(letter) {
		let color = keyboard[letter.toUpperCase()];

		switch (color){
			case 0: 
				color = 'white';
				break;
			case 1:
				color = 'gray';
				break;
			case 2:
				color = 'yellow';
				break;		
			case 3:
				color = 'green';
				break;
	}

	return color;
}

function reset_color_button(button) {
	button.classList.remove('white-button-keyboard');
	button.classList.remove('gray-button-keyboard');
	button.classList.remove('yellow-button-keyboard');
	button.classList.remove('green-button-keyboard');
}

function sync_keyboard() {
	let color = null;
	let button = null;

	for(let key in keyboard){
		button = document.querySelector(`.button-keyboard[data-letter=${key.toUpperCase()}]`);
		reset_color_button(button);

		switch (keyboard[key.toUpperCase()]){
			case 0: 
				button.classList.add('white-button-keyboard');
				break;
			case 1:
				button.classList.add('gray-button-keyboard');
				break;
			case 2:
				button.classList.add('yellow-button-keyboard');
				break;
			case 3:
				button.classList.add('green-button-keyboard');
				break;
			}
	}
}

function save_game(){
	if (game_loaded_from_url === true)
		return;

	let my_storage = localStorage;
	
	my_storage.setItem('board', JSON.stringify(board));
	my_storage.setItem('keyboard', JSON.stringify(keyboard));
	my_storage.setItem('entered_words', JSON.stringify(entered_words));
	my_storage.setItem('hidden_word', JSON.stringify(hidden_word));
	my_storage.setItem('line_in_board', line_in_board);
	my_storage.setItem('save', 'true');
}

function load_game(){
	let my_storage = localStorage;

	if (my_storage.getItem('save') != undefined){
		board = JSON.parse(my_storage.getItem('board'));
		keyboard = JSON.parse(my_storage.getItem('keyboard'));
		entered_words = JSON.parse(my_storage.getItem('entered_words'));
		hidden_word = JSON.parse(my_storage.getItem('hidden_word'));
		line_in_board = Number(my_storage.getItem('line_in_board'));

		for (let i = 0; i < entered_words.length; i++){
			for (let j = 0; j < entered_words[i].length; j++){
				document.getElementById(`tile-${i}-${j}`).innerHTML = entered_words[i][j].toUpperCase();
			}
		}
		sync_board();
		sync_keyboard();

		return true;
	} else {
		return false;
	}
}

function clear_save_game(){
	if (game_loaded_from_url === true)
		return;

	let my_storage = localStorage;
	my_storage.clear();
}

function get_url_from_game_state(number_strings=null) {
	let entered_words_for_url = [];

	for (let i = 0; i < entered_words.length; i++) {
		entered_words_for_url.push(entered_words[i].join(''));		
	}

	if (number_strings != null){
		entered_words_for_url = entered_words_for_url.slice(0, number_strings);
	}

	let url = [].concat([hidden_word.join('')], entered_words_for_url).join(',');
	let encode_url = [];

	for (let i = 0; i < url.length; i++) {
		encode_url.push(url[i].charCodeAt());
	}

	return 'Словограйчик - відгадай таємне слово.\n\nСпробуйте відгадати мою загадку.\n\n#словограйчик\n\n' + window.location.href.replace(window.location.search.replace('?puzzle=', '') , '') + '?puzzle=' + encode_url.join(',');
}

function set_game_state_from_url() {
	try {
		let hash = window.location.search.replace('?puzzle=', '').split(',');
		let state_game = '';

		for (let i = 0; i < hash.length; i++){
			state_game = state_game + String.fromCharCode(Number(hash[i]));
		}

		state_game = state_game.split(',');

		hidden_word = state_game[0].split('');
		entered_words = state_game;
		entered_words.shift();

		for (let i = 0; i < entered_words.length; i++){
			user_word = entered_words[i].split('');
			entered_words[i] = entered_words[i].split('');

			for (let j = 0; j < user_word.length; j++){
				document.getElementById(`tile-${line_in_board}-${j}`).innerHTML = user_word[j].toUpperCase();
			}

			word_match_count();
			line_in_board++;
		}

		user_word = [];

		sync_board();
		sync_keyboard();
	} catch (error){
		toast('Сталася помилка при завантаженні загадки.');
		setTimeout(() => {
			window.location.href = window.location.href.replace(window.location.search, '');
		}, 2000);
	}
}

function toggleFullScreen() {
  if (!document.fullscreenElement &&
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }

    document.querySelector('#fullscreen-button > img').src = 'images/fullscreen-exit.svg';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }

    document.querySelector('#fullscreen-button > img').src = 'images/fullscreen.svg';
  }
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('fullscreen-button').onclick = toggleFullScreen;

	if (window.location.search.replace('?puzzle=', '') != ''){
		set_game_state_from_url();
		game_loaded_from_url = true;
	} else if (load_game() == false){
		make_a_word();
	}
})