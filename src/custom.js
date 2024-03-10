/**
 * Generates a hash value for a string
 * This was modified from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 */
String.prototype.hashCode = function () {
	let hash = 0,
		i,
		chr,
		len;
	if (this.length === 0) return hash;
	for (i = 0, len = this.length; i < len; i++) {
		chr = this.charCodeAt(i);
		hash = (hash << 31) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};
