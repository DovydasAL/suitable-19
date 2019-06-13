function divisionSolver(list) {
	//If this is merely an integer, return it
	if (!Array.isArray(list)) {
		return list;
	}
	//If the initial value is a list itself, evaluate it
	if (Array.isArray(list[0])) {
		list[0] = divisionSolver(list[0]);
	}
	//Divide initial value by the evaluation of every other object in array
	for (let i=1;i<list.length;i++)
		list[0] = list[0] / divisionSolver(list[i]);
	return list[0];
}

function runTests(tests, answers) {
	var passed = 0;
	for (var i=0; i<tests.length;i++) {
		if (answers[i] !== divisionSolver(tests[i])) {
			console.log("FAILED - " + tests[i]);
			console.log("EXPECTED: " + answers[i]);
			console.log("RESULT: " + divisionSolver(tests[i]));
			continue;
		}
		passed = passed + 1;
	}
	console.log("==========\nPassed: " + passed + "\nFailed: " + (tests.length - passed) + "\n==========");
}

oneDTests = [[100], [100,4], [100,60], [100,2,5], [100,2,60], [50,2,5,5], [100,2,2,20]];
oneDAnswers = [100, 100 / 4, 100 / 60, 100 / 2 / 5, 100 / 2 / 60, 50 / 2 / 5 / 5, 100 / 2 / 2 /20]
runTests(oneDTests, oneDAnswers);
twoDTests = [[100, [10,2]], [100, [5], 2], [50, [100, 25, 2]], [[100, 2, 2], [25, 5]]];
twoDAnswers = [100 / (10 / 2), 100 / 5 / 2, 50 / (100 / 25 / 2), (100 / 2 /2) / (25 / 5)];
runTests(twoDTests, twoDAnswers);

