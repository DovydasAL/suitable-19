const teammates = require('../seed/out/teammates.json');
const restaurants = require('../seed/out/restaurants.json');
const ratings = require('../seed/out/ratings.json');

for (var i=0;i<teammates.length;i++) {
	main(teammates[i].id);
}


/*
===============================
		Main Functions
===============================
*/

//Main Function, will display top 3 restaurants by name for a given tid
function main(tid) {
	var restaurants = top3Restaurants(tid);
	console.log("==========\nTop 3 restaurants for tid: " + tid);
	for (var i=0;i<restaurants.length;i++) {
		console.log(restaurants[i]);
	}
}

//Function computes all prediction values for a given tid
//Returns object in the format [{rid: "", predictionValue: int}]
function computeAllPredictions(tid) {
	var predictions = [];
	for (var i=0;i<restaurants.length;i++) {
		var rid = restaurants[i].id;
		var predictionValue = prediction(tid, rid);
		var result = {};
		result["rid"] = rid;
		result["predictionValue"] = predictionValue;
		predictions.push(result);
	}
	return predictions;
}

//Function returns the top 3 restaurants by name for a given tid
function top3Restaurants(tid) {
	var predictions = computeAllPredictions(tid);
	var top3Restaurants = [];
	var visited = visitedRestaurants(tid);
	for (var i=0;i<predictions.length;i++) {
		if ((top3Restaurants.length < 3 || predictions[i].predictionValue > top3Restaurants[2].predictionValue) && !visited[predictions[i].rid]) {
			top3Restaurants = predictionValueSort(top3Restaurants, predictions[i]).slice(0,3);
		}
	}
	var top3Names = [];
	for (var i=0;i<top3Restaurants.length;i++) {
		top3Names.push(restaurantById(top3Restaurants[i].rid));
	}
	return top3Names;
}

//Function computes the similarity index for two given teammates based on the likes and dislikes of the two
function similarityIndex(t1, t2) {
	var t1Likes = getLikes(t1);
	var t2Likes = getLikes(t2);
	var t1Dislikes = getDislikes(t1);
	var t2Dislikes = getDislikes(t2);
	return ((intersection(t1Likes, t2Likes).length + intersection(t1Dislikes, t2Dislikes).length - intersection(t1Likes, t2Dislikes).length - intersection(t1Dislikes, t2Likes).length)
		 / union(union(t1Likes, t1Dislikes), union(t2Likes, t2Dislikes)).length);

}

//Function computes a single prediction value for a given tid and rid
function prediction(tid, rid) {
	var restaurantLikes = getRestaurantLikes(rid);
	var restaurantDislikes = getRestaurantDislikes(rid);
	var likeSum = 0;
	for (var i=0;i<restaurantLikes.length;i++) {
		likeSum = likeSum + similarityIndex(tid, restaurantLikes[i]);	
	}
	var dislikeSum = 0;
	for (var i=0;i<restaurantDislikes.length;i++) {
		dislikeSum = dislikeSum + similarityIndex(tid, restaurantDislikes[i]);
	}
	return ((likeSum - dislikeSum) / (restaurantLikes.length + restaurantDislikes.length));

}
/*
===============================
		Helper
===============================
*/

//Computes a hash of a tid's visited restaurants
function visitedRestaurants(tid) {
	var visited = {};
	for (var i=0;i<ratings.length;i++) {
		if (ratings[i].teammateId === tid) {
			visited[ratings[i].restaurantId] = true;
		}
	}
	return visited;
}

//Function finds a given restaurant name by its id;
function restaurantById(rid) {
	for (var i=0;i<restaurants.length;i++) {
		if (restaurants[i].id === rid) {
			return restaurants[i].name;
		}
	}
}

//Sorts objects by predictionValue using an insertion sort
function predictionValueSort(array, prediction) {
	if (array.length === 0) {
		array.push(prediction);
		return array;
	}
	for (var i=0;i<array.length;i++) {
		if (prediction.predictionValue > array[i].predictionValue) {
			var temp1 = array.slice(0,i);
			var temp2 = array.slice(i);
			var sorted = temp1.concat(prediction);
			var sorted = sorted.concat(temp2);
			return sorted;
		}
	}
	return array;
}

//Function returns the intersection of two arrays
function intersection(s1, s2) {
	var shorter = (s1.length < s2.length) ? s1 : s2;
	var longer = (shorter === s1) ? s2 : s1;
	var longerHash = {};
	for (var i=0;i<longer.length;i++) {
		longerHash[longer[i]] = true;
	}
	var intersection = []
	for (var i=0;i<shorter.length;i++) {
		if (longerHash[shorter[i]]) {
			intersection.push(shorter[i]);
		}
	}
	return intersection;
}

//Function returns the union of two arrays
function union(s1, s2) {
	var union = [];
	var s1Hash = {};
	for (var i=0;i<s1.length;i++) {
		union.push(s1[i]);
		s1Hash[s1[i]] = true;
	}
	for (vari=0;i<s2.length;i++) {
		if (s1Hash[s2[i]]) {
			continue;
		}
		union.push(s2[i]);
	}
	return union;
}

//Get all of a the likes for a given tid
function getLikes(tid) {
	var likes = [];
	for (var i=0;i<ratings.length;i++) {
		if (ratings[i].teammateId === tid && ratings[i].rating === "LIKE") {
			likes.push(ratings[i].restaurantId);
		}
	}
	return likes;
}

//Get all of the dislikes for a given tid
function getDislikes(tid) {
	var dislikes = [];
	for (var i=0;i<ratings.length;i++) {
		if (ratings[i].teammateId === tid && ratings[i].rating === "DISLIKE") {
			dislikes.push(ratings[i].restaurantId);
		}
	}
	return dislikes;
}

//Get all of the tids that like a given restaurant
function getRestaurantLikes(rid) {
	var tids = [];
	for (var i=0;i<ratings.length;i++) {
		if (ratings[i].restaurantId === rid && ratings[i].rating === "LIKE") {
			tids.push(ratings[i].teammateId);
		}
	}
	return tids;
}

//Get all of the tids that dislike a given restaurant
function getRestaurantDislikes(rid) {
	var tids = []
	for (var i=0;i<ratings.length;i++) {
		if (ratings[i].restaurantId === rid && ratings[i].rating === "DISLIKE") {
			tids.push(ratings[i].teammateId);
		}
	}
	return tids;
}

/*
===============================
		Tests
===============================
*/

//Tests to see if similarity index falls between -1 and 1
function testSimilarityIndexBounds() {
	var result = [];
	for (var i=0;i<teammates.length;i++) {
		for (var j=0;j<teammates.length;j++) {
			if (teammates[i] !== teammates[j]) {
				var s = similarityIndex(teammates[i].id, teammates[j].id);
				if (s < -1 || s > 1) {
					console.log("SIMILARITY INDEX OUT OF BOUNDS: " + s);
				}
				result.push(s);
			}
		}
	}
}


