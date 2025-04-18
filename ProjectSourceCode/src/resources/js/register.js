
const typeSelect = document.getElementById('user_type');
const classesLabel = document.getElementById('classes_label');
const learningLabel = document.getElementById('learning_label');

typeSelect.onchange = () => {
    const val = typeSelect.value;
    if(val == 'Student') {
        classesLabel.innerText = 'Classes Needing Tutoring For';
        learningLabel.innerText = 'Pick Your Learning Style';
    } else {
        classesLabel.innerText = 'Classes You\'ll Teach';
        learningLabel.innerText = 'Pick Your Teaching Style';
    }
};