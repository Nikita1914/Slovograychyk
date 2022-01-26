const WHITE_COLOR = 'white'
const GRAY_COLOR = 'gray'
const YELLOW_COLOR = 'yellow'
const GREEN_COLOR = 'green'

let matrix = [[0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0]
						 ];
let line_in_matrix = 0;
let column_in_matrix = 0;
let user_word = [];
let hidden_word = '';
let end_game = false;
let lock_buttons = false;

document.querySelectorAll('.button-keyboard').forEach(function(button) {
	button.onclick = () => {
		button.blur();
		button_clicked(button.dataset.letter);
	}
});

document.addEventListener('keydown', (event) => {
	if (lock_buttons)
		return

	allowed_keys = ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г',
									'Ш', 'Щ', 'З', 'Х', 'Ї', 'Ф', 'І', 
									'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 
									'Ж', 'Є', 'Я', 'Ч', 'С', 'М', 'И', 
									'Т', 'Ь', 'Б', 'Ю', 'BACKSPACE', 'ENTER'];

	if (end_game){
		end_game = false;
		reset_game();
	} else {
		key = event.key.toUpperCase();
			if(allowed_keys.indexOf(key) != -1)
				button_clicked(key);
	}
});

function button_clicked(letter){
	if (lock_buttons)
		return;
	
	if (end_game){
		end_game = false;
		reset_game();
		return;
	}

	if (letter.toUpperCase() === 'ENTER'){
		word_entered()		
	} else if (letter.toUpperCase() === 'BACKSPACE'){		
		backspace_pressed();
	} else if (column_in_matrix < 5){
		document.getElementById(`tile-${line_in_matrix}-${column_in_matrix}`).innerHTML = letter;
		user_word.push(letter.toLowerCase());
		column_in_matrix++;
	}
}

function backspace_pressed() {
	if (column_in_matrix > 0){	
		user_word = user_word.slice(0, -1);
		
		column_in_matrix--;
		document.getElementById(`tile-${line_in_matrix}-${column_in_matrix}`).innerHTML = ' ';
	}
}

function word_entered() {
	if (column_in_matrix === 5) {
		if(check_user_word()){
			let number_of_coincidences = word_match_count();
			
			if (number_of_coincidences === 5){
				toast('Ви вгадали!');
				end_game = true;
			} else {
				if (line_in_matrix != 5){
					line_in_matrix ++;
					column_in_matrix = 0;
					user_word = [];
				} else {
					toast(`Ви програли. Загадане слово: ${hidden_word.join('')}.`);
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
	let button;

	// Match green letter 
	for(let i = 0; i < hidden_word.length; i++){
		if(user_word[i] === hidden_word[i]){
			// rotate_tile(get_tile(line_in_matrix, i));
			// setTimeout((a, b) => {set_color_tile(a, b, 'green');}, 1500, line_in_matrix, i);
			set_color_tile(line_in_matrix, i, 'green');
			document.querySelector(`.button-keyboard[data-letter=${user_word[i].toUpperCase()}]`).style.background = 'green';
			hidden_word[i] = '0';
			number_of_coincidences++;
		} 
	}

	// Match yellow and gray letter
	for(let i = 0; i < hidden_word.length; i++){
		count_yellow = count_yellow_letter(user_word[i]);

		if (count_yellow.length > 0) {
			if (get_color_tile(line_in_matrix, i) != 'green'){
				hidden_word[count_yellow[0]] = '0';
				set_color_tile(line_in_matrix, i, 'yellow');
				button = document.querySelector(`.button-keyboard[data-letter=${user_word[i].toUpperCase()}]`);
				
				if (button.style.background != 'green')
					button.style.background = 'yellow';
			}
		} else {
			if (get_color_tile(line_in_matrix, i) != 'green'){
				set_color_tile(line_in_matrix, i, 'gray')

				button = document.querySelector(`.button-keyboard[data-letter=${user_word[i].toUpperCase()}]`);
				
				if ((button.style.background != 'green') && (button.style.background != 'yellow'))
					button.style.background = 'gray';
			}
		}
	}
	
	sync_matrix()
	hidden_word = old_hidden_word;
	return number_of_coincidences;
}

function count_yellow_letter(letter){
	let index_list = [];
	letter = letter.toLowerCase();

	for(let i = 0; i < hidden_word.length; i++){
		if (hidden_word[i] === letter)
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

	console.log('Загадане слово: ', hidden_word);
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
	make_a_word();

	document.querySelectorAll('.button-keyboard').forEach((button) => {
		button.style.background = 'white';
	});

	document.querySelectorAll('.tile').forEach((tile) => {
		setTimeout(() => {tile.style.background = 'white'; tile.innerHTML = ' ';}, 1000)
		rotate_tile(tile);
	});

	line_in_matrix = 0;
	column_in_matrix = 0;
	user_word = [];
	matrix = [[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0]
					 ];
}

function rotate_tile(tile){
	lock_buttons = true;
	tile.style.transition = 'transform 2s linear';

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


	matrix[tile_row][tile_column] = color;
}

function get_color_tile(tile_row, tile_column) {
	color =  matrix[tile_row][tile_column];

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

function sync_matrix(){
	let tile = null;

	for (let i = 0; i < matrix.length; i++){
		for (let j = 0; j < matrix[i].length; j++){
			tile = document.getElementById(`tile-${i}-${j}`)

			switch (matrix[i][j]){
				case 0: 
					tile.style.background = WHITE_COLOR;
					break;
				case 1:
					tile.style.background = GRAY_COLOR;
					break;
				case 2:
					tile.style.background = YELLOW_COLOR;
					break;		
				case 3:
					tile.style.background = GREEN_COLOR;
					break;
			}
		}
	}
}

make_a_word();