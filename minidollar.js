/**
 * The $1 Unistroke Recognizer (C# version)
 *
 *		Jacob O. Wobbrock, Ph.D.
 * 		The Information School
 *		University of Washington
 *		Mary Gates Hall, Box 352840
 *		Seattle, WA 98195-2840
 *		wobbrock@u.washington.edu
 *
 *		Andrew D. Wilson, Ph.D.
 *		Microsoft Research
 *		One Microsoft Way
 *		Redmond, WA 98052
 *		awilson@microsoft.com
 *
 *		Yang Li, Ph.D.
 *		Department of Computer Science and Engineering
 * 		University of Washington
 *		The Allen Center, Box 352350
 *		Seattle, WA 98195-2840
 * 		yangli@cs.washington.edu
 *
 * The Protractor enhancement was published by Yang Li and programmed here by 
 * Jacob O. Wobbrock.
 *
 *	Li, Y. (2010). Protractor: A fast and accurate gesture 
 *	  recognizer. Proceedings of the ACM Conference on Human 
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 * 
 * This software is distributed under the "New BSD License" agreement:
 * 
 * Copyright (c) 2007-2011, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote 
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, 
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, 
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

// Made slightly more javascript-y by Jacob Waller

(function(global, Math, Infinity){
//
// Point class
//
function Point(x, y) { // constructor
    this.X = x;
    this.Y = y;
}

//
// Rectangle class
//
function Rectangle(x, y, width, height) { // constructor
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
}

//
// Template class: a unistroke template
//
function Template(name, points) { // constructor
    this.Name = name;
    this.Points = Resample(points, NumPoints);
    var radians = IndicativeAngle(this.Points);
    this.Points = RotateBy(this.Points, -radians);
    this.Points = ScaleTo(this.Points, SquareSize);
    this.Points = TranslateTo(this.Points, Origin);
    this.Vector = Vectorize(this.Points); // for Protractor
}

//
// Result class
//
function Result(name, score) { // constructor
    this.Name = name;
    this.Score = score;
}

//
// DollarRecognizer class constants
//
var NumTemplates = 16,
	NumPoints = 16,
	SquareSize = 100.0,
	Origin = {
    X: 0,
    Y: 0
},
	Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize),
	HalfDiagonal = 0.5 * Diagonal,
	AngleRange = Deg2Rad(45.0),
	AnglePrecision = Deg2Rad(2.0),
	Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//

var DollarRecognizer = global.DollarRecognizer = function() { // constructor
    //
    // one predefined template for each unistroke type
    //

    this.Templates = [
		new Template("triangle", new Array({ X: 137, Y: 139 },{ X: 135, Y: 141 },{ X: 133, Y: 144 },{ X: 132, Y: 146 },{ X: 130, Y: 149 },{ X: 128, Y: 151 },{ X: 126, Y: 155 },{ X: 123, Y: 160 },{ X: 120, Y: 166 },{ X: 116, Y: 171 },{ X: 112, Y: 177 },{ X: 107, Y: 183 },{ X: 102, Y: 188 },{ X: 100, Y: 191 },{ X: 95, Y: 195 },{ X: 90, Y: 199 },{ X: 86, Y: 203 },{ X: 82, Y: 206 },{ X: 80, Y: 209 },{ X: 75, Y: 213 },{ X: 73, Y: 213 },{ X: 70, Y: 216 },{ X: 67, Y: 219 },{ X: 64, Y: 221 },{ X: 61, Y: 223 },{ X: 60, Y: 225 },{ X: 62, Y: 226 },{ X: 65, Y: 225 },{ X: 67, Y: 226 },{ X: 74, Y: 226 },{ X: 77, Y: 227 },{ X: 85, Y: 229 },{ X: 91, Y: 230 },{ X: 99, Y: 231 },{ X: 108, Y: 232 },{ X: 116, Y: 233 },{ X: 125, Y: 233 },{ X: 134, Y: 234 },{ X: 145, Y: 233 },{ X: 153, Y: 232 },{ X: 160, Y: 233 },{ X: 170, Y: 234 },{ X: 177, Y: 235 },{ X: 179, Y: 236 },{ X: 186, Y: 237 },{ X: 193, Y: 238 },{ X: 198, Y: 239 },{ X: 200, Y: 237 },{ X: 202, Y: 239 },{ X: 204, Y: 238 },{ X: 206, Y: 234 },{ X: 205, Y: 230 },{ X: 202, Y: 222 },{ X: 197, Y: 216 },{ X: 192, Y: 207 },{ X: 186, Y: 198 },{ X: 179, Y: 189 },{ X: 174, Y: 183 },{ X: 170, Y: 178 },{ X: 164, Y: 171 },{ X: 161, Y: 168 },{ X: 154, Y: 160 },{ X: 148, Y: 155 },{ X: 143, Y: 150 },{ X: 138, Y: 148 },{ X: 136, Y: 148 })),
		new Template("x", new Array({ X: 87, Y: 142 },{ X: 89, Y: 145 },{ X: 91, Y: 148 },{ X: 93, Y: 151 },{ X: 96, Y: 155 },{ X: 98, Y: 157 },{ X: 100, Y: 160 },{ X: 102, Y: 162 },{ X: 106, Y: 167 },{ X: 108, Y: 169 },{ X: 110, Y: 171 },{ X: 115, Y: 177 },{ X: 119, Y: 183 },{ X: 123, Y: 189 },{ X: 127, Y: 193 },{ X: 129, Y: 196 },{ X: 133, Y: 200 },{ X: 137, Y: 206 },{ X: 140, Y: 209 },{ X: 143, Y: 212 },{ X: 146, Y: 215 },{ X: 151, Y: 220 },{ X: 153, Y: 222 },{ X: 155, Y: 223 },{ X: 157, Y: 225 },{ X: 158, Y: 223 },{ X: 157, Y: 218 },{ X: 155, Y: 211 },{ X: 154, Y: 208 },{ X: 152, Y: 200 },{ X: 150, Y: 189 },{ X: 148, Y: 179 },{ X: 147, Y: 170 },{ X: 147, Y: 158 },{ X: 147, Y: 148 },{ X: 147, Y: 141 },{ X: 147, Y: 136 },{ X: 144, Y: 135 },{ X: 142, Y: 137 },{ X: 140, Y: 139 },{ X: 135, Y: 145 },{ X: 131, Y: 152 },{ X: 124, Y: 163 },{ X: 116, Y: 177 },{ X: 108, Y: 191 },{ X: 100, Y: 206 },{ X: 94, Y: 217 },{ X: 91, Y: 222 },{ X: 89, Y: 225 },{ X: 87, Y: 226 },{ X: 87, Y: 224 })),
		new Template("rectangle", new Array({ X: 78, Y: 149 },{ X: 78, Y: 153 },{ X: 78, Y: 157 },{ X: 78, Y: 160 },{ X: 79, Y: 162 },{ X: 79, Y: 164 },{ X: 79, Y: 167 },{ X: 79, Y: 169 },{ X: 79, Y: 173 },{ X: 79, Y: 178 },{ X: 79, Y: 183 },{ X: 80, Y: 189 },{ X: 80, Y: 193 },{ X: 80, Y: 198 },{ X: 80, Y: 202 },{ X: 81, Y: 208 },{ X: 81, Y: 210 },{ X: 81, Y: 216 },{ X: 82, Y: 222 },{ X: 82, Y: 224 },{ X: 82, Y: 227 },{ X: 83, Y: 229 },{ X: 83, Y: 231 },{ X: 85, Y: 230 },{ X: 88, Y: 232 },{ X: 90, Y: 233 },{ X: 92, Y: 232 },{ X: 94, Y: 233 },{ X: 99, Y: 232 },{ X: 102, Y: 233 },{ X: 106, Y: 233 },{ X: 109, Y: 234 },{ X: 117, Y: 235 },{ X: 123, Y: 236 },{ X: 126, Y: 236 },{ X: 135, Y: 237 },{ X: 142, Y: 238 },{ X: 145, Y: 238 },{ X: 152, Y: 238 },{ X: 154, Y: 239 },{ X: 165, Y: 238 },{ X: 174, Y: 237 },{ X: 179, Y: 236 },{ X: 186, Y: 235 },{ X: 191, Y: 235 },{ X: 195, Y: 233 },{ X: 197, Y: 233 },{ X: 200, Y: 233 },{ X: 201, Y: 235 },{ X: 201, Y: 233 },{ X: 199, Y: 231 },{ X: 198, Y: 226 },{ X: 198, Y: 220 },{ X: 196, Y: 207 },{ X: 195, Y: 195 },{ X: 195, Y: 181 },{ X: 195, Y: 173 },{ X: 195, Y: 163 },{ X: 194, Y: 155 },{ X: 192, Y: 145 },{ X: 192, Y: 143 },{ X: 192, Y: 138 },{ X: 191, Y: 135 },{ X: 191, Y: 133 },{ X: 191, Y: 130 },{ X: 190, Y: 128 },{ X: 188, Y: 129 },{ X: 186, Y: 129 },{ X: 181, Y: 132 },{ X: 173, Y: 131 },{ X: 162, Y: 131 },{ X: 151, Y: 132 },{ X: 149, Y: 132 },{ X: 138, Y: 132 },{ X: 136, Y: 132 },{ X: 122, Y: 131 },{ X: 120, Y: 131 },{ X: 109, Y: 130 },{ X: 107, Y: 130 },{ X: 90, Y: 132 },{ X: 81, Y: 133 },{ X: 76, Y: 133 })),
		new Template("circle", new Array({ X: 127, Y: 141 },{ X: 124, Y: 140 },{ X: 120, Y: 139 },{ X: 118, Y: 139 },{ X: 116, Y: 139 },{ X: 111, Y: 140 },{ X: 109, Y: 141 },{ X: 104, Y: 144 },{ X: 100, Y: 147 },{ X: 96, Y: 152 },{ X: 93, Y: 157 },{ X: 90, Y: 163 },{ X: 87, Y: 169 },{ X: 85, Y: 175 },{ X: 83, Y: 181 },{ X: 82, Y: 190 },{ X: 82, Y: 195 },{ X: 83, Y: 200 },{ X: 84, Y: 205 },{ X: 88, Y: 213 },{ X: 91, Y: 216 },{ X: 96, Y: 219 },{ X: 103, Y: 222 },{ X: 108, Y: 224 },{ X: 111, Y: 224 },{ X: 120, Y: 224 },{ X: 133, Y: 223 },{ X: 142, Y: 222 },{ X: 152, Y: 218 },{ X: 160, Y: 214 },{ X: 167, Y: 210 },{ X: 173, Y: 204 },{ X: 178, Y: 198 },{ X: 179, Y: 196 },{ X: 182, Y: 188 },{ X: 182, Y: 177 },{ X: 178, Y: 167 },{ X: 170, Y: 150 },{ X: 163, Y: 138 },{ X: 152, Y: 130 },{ X: 143, Y: 129 },{ X: 140, Y: 131 },{ X: 129, Y: 136 },{ X: 126, Y: 139 })),
		new Template("check", new Array({ X: 91, Y: 185 },{ X: 93, Y: 185 },{ X: 95, Y: 185 },{ X: 97, Y: 185 },{ X: 100, Y: 188 },{ X: 102, Y: 189 },{ X: 104, Y: 190 },{ X: 106, Y: 193 },{ X: 108, Y: 195 },{ X: 110, Y: 198 },{ X: 112, Y: 201 },{ X: 114, Y: 204 },{ X: 115, Y: 207 },{ X: 117, Y: 210 },{ X: 118, Y: 212 },{ X: 120, Y: 214 },{ X: 121, Y: 217 },{ X: 122, Y: 219 },{ X: 123, Y: 222 },{ X: 124, Y: 224 },{ X: 126, Y: 226 },{ X: 127, Y: 229 },{ X: 129, Y: 231 },{ X: 130, Y: 233 },{ X: 129, Y: 231 },{ X: 129, Y: 228 },{ X: 129, Y: 226 },{ X: 129, Y: 224 },{ X: 129, Y: 221 },{ X: 129, Y: 218 },{ X: 129, Y: 212 },{ X: 129, Y: 208 },{ X: 130, Y: 198 },{ X: 132, Y: 189 },{ X: 134, Y: 182 },{ X: 137, Y: 173 },{ X: 143, Y: 164 },{ X: 147, Y: 157 },{ X: 151, Y: 151 },{ X: 155, Y: 144 },{ X: 161, Y: 137 },{ X: 165, Y: 131 },{ X: 171, Y: 122 },{ X: 174, Y: 118 },{ X: 176, Y: 114 },{ X: 177, Y: 112 },{ X: 177, Y: 114 },{ X: 175, Y: 116 },{ X: 173, Y: 118 })),
		new Template("caret", new Array({ X: 79, Y: 245 },{ X: 79, Y: 242 },{ X: 79, Y: 239 },{ X: 80, Y: 237 },{ X: 80, Y: 234 },{ X: 81, Y: 232 },{ X: 82, Y: 230 },{ X: 84, Y: 224 },{ X: 86, Y: 220 },{ X: 86, Y: 218 },{ X: 87, Y: 216 },{ X: 88, Y: 213 },{ X: 90, Y: 207 },{ X: 91, Y: 202 },{ X: 92, Y: 200 },{ X: 93, Y: 194 },{ X: 94, Y: 192 },{ X: 96, Y: 189 },{ X: 97, Y: 186 },{ X: 100, Y: 179 },{ X: 102, Y: 173 },{ X: 105, Y: 165 },{ X: 107, Y: 160 },{ X: 109, Y: 158 },{ X: 112, Y: 151 },{ X: 115, Y: 144 },{ X: 117, Y: 139 },{ X: 119, Y: 136 },{ X: 119, Y: 134 },{ X: 120, Y: 132 },{ X: 121, Y: 129 },{ X: 122, Y: 127 },{ X: 124, Y: 125 },{ X: 126, Y: 124 },{ X: 129, Y: 125 },{ X: 131, Y: 127 },{ X: 132, Y: 130 },{ X: 136, Y: 139 },{ X: 141, Y: 154 },{ X: 145, Y: 166 },{ X: 151, Y: 182 },{ X: 156, Y: 193 },{ X: 157, Y: 196 },{ X: 161, Y: 209 },{ X: 162, Y: 211 },{ X: 167, Y: 223 },{ X: 169, Y: 229 },{ X: 170, Y: 231 },{ X: 173, Y: 237 },{ X: 176, Y: 242 },{ X: 177, Y: 244 },{ X: 179, Y: 250 },{ X: 181, Y: 255 },{ X: 182, Y: 257 })),
		new Template("zig-zag", new Array({ X: 307, Y: 216 },{ X: 333, Y: 186 },{ X: 356, Y: 215 },{ X: 375, Y: 186 },{ X: 399, Y: 216 },{ X: 418, Y: 186 })),
		new Template("arrow", new Array({ X: 68, Y: 222 },{ X: 70, Y: 220 },{ X: 73, Y: 218 },{ X: 75, Y: 217 },{ X: 77, Y: 215 },{ X: 80, Y: 213 },{ X: 82, Y: 212 },{ X: 84, Y: 210 },{ X: 87, Y: 209 },{ X: 89, Y: 208 },{ X: 92, Y: 206 },{ X: 95, Y: 204 },{ X: 101, Y: 201 },{ X: 106, Y: 198 },{ X: 112, Y: 194 },{ X: 118, Y: 191 },{ X: 124, Y: 187 },{ X: 127, Y: 186 },{ X: 132, Y: 183 },{ X: 138, Y: 181 },{ X: 141, Y: 180 },{ X: 146, Y: 178 },{ X: 154, Y: 173 },{ X: 159, Y: 171 },{ X: 161, Y: 170 },{ X: 166, Y: 167 },{ X: 168, Y: 167 },{ X: 171, Y: 166 },{ X: 174, Y: 164 },{ X: 177, Y: 162 },{ X: 180, Y: 160 },{ X: 182, Y: 158 },{ X: 183, Y: 156 },{ X: 181, Y: 154 },{ X: 178, Y: 153 },{ X: 171, Y: 153 },{ X: 164, Y: 153 },{ X: 160, Y: 153 },{ X: 150, Y: 154 },{ X: 147, Y: 155 },{ X: 141, Y: 157 },{ X: 137, Y: 158 },{ X: 135, Y: 158 },{ X: 137, Y: 158 },{ X: 140, Y: 157 },{ X: 143, Y: 156 },{ X: 151, Y: 154 },{ X: 160, Y: 152 },{ X: 170, Y: 149 },{ X: 179, Y: 147 },{ X: 185, Y: 145 },{ X: 192, Y: 144 },{ X: 196, Y: 144 },{ X: 198, Y: 144 },{ X: 200, Y: 144 },{ X: 201, Y: 147 },{ X: 199, Y: 149 },{ X: 194, Y: 157 },{ X: 191, Y: 160 },{ X: 186, Y: 167 },{ X: 180, Y: 176 },{ X: 177, Y: 179 },{ X: 171, Y: 187 },{ X: 169, Y: 189 },{ X: 165, Y: 194 },{ X: 164, Y: 196 })),
		new Template("left square bracket", new Array({ X: 140, Y: 124 },{ X: 138, Y: 123 },{ X: 135, Y: 122 },{ X: 133, Y: 123 },{ X: 130, Y: 123 },{ X: 128, Y: 124 },{ X: 125, Y: 125 },{ X: 122, Y: 124 },{ X: 120, Y: 124 },{ X: 118, Y: 124 },{ X: 116, Y: 125 },{ X: 113, Y: 125 },{ X: 111, Y: 125 },{ X: 108, Y: 124 },{ X: 106, Y: 125 },{ X: 104, Y: 125 },{ X: 102, Y: 124 },{ X: 100, Y: 123 },{ X: 98, Y: 123 },{ X: 95, Y: 124 },{ X: 93, Y: 123 },{ X: 90, Y: 124 },{ X: 88, Y: 124 },{ X: 85, Y: 125 },{ X: 83, Y: 126 },{ X: 81, Y: 127 },{ X: 81, Y: 129 },{ X: 82, Y: 131 },{ X: 82, Y: 134 },{ X: 83, Y: 138 },{ X: 84, Y: 141 },{ X: 84, Y: 144 },{ X: 85, Y: 148 },{ X: 85, Y: 151 },{ X: 86, Y: 156 },{ X: 86, Y: 160 },{ X: 86, Y: 164 },{ X: 86, Y: 168 },{ X: 87, Y: 171 },{ X: 87, Y: 175 },{ X: 87, Y: 179 },{ X: 87, Y: 182 },{ X: 87, Y: 186 },{ X: 88, Y: 188 },{ X: 88, Y: 195 },{ X: 88, Y: 198 },{ X: 88, Y: 201 },{ X: 88, Y: 207 },{ X: 89, Y: 211 },{ X: 89, Y: 213 },{ X: 89, Y: 217 },{ X: 89, Y: 222 },{ X: 88, Y: 225 },{ X: 88, Y: 229 },{ X: 88, Y: 231 },{ X: 88, Y: 233 },{ X: 88, Y: 235 },{ X: 89, Y: 237 },{ X: 89, Y: 240 },{ X: 89, Y: 242 },{ X: 91, Y: 241 },{ X: 94, Y: 241 },{ X: 96, Y: 240 },{ X: 98, Y: 239 },{ X: 105, Y: 240 },{ X: 109, Y: 240 },{ X: 113, Y: 239 },{ X: 116, Y: 240 },{ X: 121, Y: 239 },{ X: 130, Y: 240 },{ X: 136, Y: 237 },{ X: 139, Y: 237 },{ X: 144, Y: 238 },{ X: 151, Y: 237 },{ X: 157, Y: 236 },{ X: 159, Y: 237 })),
		new Template("right square bracket", new Array({ X: 112, Y: 138 },{ X: 112, Y: 136 },{ X: 115, Y: 136 },{ X: 118, Y: 137 },{ X: 120, Y: 136 },{ X: 123, Y: 136 },{ X: 125, Y: 136 },{ X: 128, Y: 136 },{ X: 131, Y: 136 },{ X: 134, Y: 135 },{ X: 137, Y: 135 },{ X: 140, Y: 134 },{ X: 143, Y: 133 },{ X: 145, Y: 132 },{ X: 147, Y: 132 },{ X: 149, Y: 132 },{ X: 152, Y: 132 },{ X: 153, Y: 134 },{ X: 154, Y: 137 },{ X: 155, Y: 141 },{ X: 156, Y: 144 },{ X: 157, Y: 152 },{ X: 158, Y: 161 },{ X: 160, Y: 170 },{ X: 162, Y: 182 },{ X: 164, Y: 192 },{ X: 166, Y: 200 },{ X: 167, Y: 209 },{ X: 168, Y: 214 },{ X: 168, Y: 216 },{ X: 169, Y: 221 },{ X: 169, Y: 223 },{ X: 169, Y: 228 },{ X: 169, Y: 231 },{ X: 166, Y: 233 },{ X: 164, Y: 234 },{ X: 161, Y: 235 },{ X: 155, Y: 236 },{ X: 147, Y: 235 },{ X: 140, Y: 233 },{ X: 131, Y: 233 },{ X: 124, Y: 233 },{ X: 117, Y: 235 },{ X: 114, Y: 238 },{ X: 112, Y: 238 })),
		new Template("v", new Array({ X: 89, Y: 164 },{ X: 90, Y: 162 },{ X: 92, Y: 162 },{ X: 94, Y: 164 },{ X: 95, Y: 166 },{ X: 96, Y: 169 },{ X: 97, Y: 171 },{ X: 99, Y: 175 },{ X: 101, Y: 178 },{ X: 103, Y: 182 },{ X: 106, Y: 189 },{ X: 108, Y: 194 },{ X: 111, Y: 199 },{ X: 114, Y: 204 },{ X: 117, Y: 209 },{ X: 119, Y: 214 },{ X: 122, Y: 218 },{ X: 124, Y: 222 },{ X: 126, Y: 225 },{ X: 128, Y: 228 },{ X: 130, Y: 229 },{ X: 133, Y: 233 },{ X: 134, Y: 236 },{ X: 136, Y: 239 },{ X: 138, Y: 240 },{ X: 139, Y: 242 },{ X: 140, Y: 244 },{ X: 142, Y: 242 },{ X: 142, Y: 240 },{ X: 142, Y: 237 },{ X: 143, Y: 235 },{ X: 143, Y: 233 },{ X: 145, Y: 229 },{ X: 146, Y: 226 },{ X: 148, Y: 217 },{ X: 149, Y: 208 },{ X: 149, Y: 205 },{ X: 151, Y: 196 },{ X: 151, Y: 193 },{ X: 153, Y: 182 },{ X: 155, Y: 172 },{ X: 157, Y: 165 },{ X: 159, Y: 160 },{ X: 162, Y: 155 },{ X: 164, Y: 150 },{ X: 165, Y: 148 },{ X: 166, Y: 146 })),
		new Template("delete", new Array({ X: 123, Y: 129 },{ X: 123, Y: 131 },{ X: 124, Y: 133 },{ X: 125, Y: 136 },{ X: 127, Y: 140 },{ X: 129, Y: 142 },{ X: 133, Y: 148 },{ X: 137, Y: 154 },{ X: 143, Y: 158 },{ X: 145, Y: 161 },{ X: 148, Y: 164 },{ X: 153, Y: 170 },{ X: 158, Y: 176 },{ X: 160, Y: 178 },{ X: 164, Y: 183 },{ X: 168, Y: 188 },{ X: 171, Y: 191 },{ X: 175, Y: 196 },{ X: 178, Y: 200 },{ X: 180, Y: 202 },{ X: 181, Y: 205 },{ X: 184, Y: 208 },{ X: 186, Y: 210 },{ X: 187, Y: 213 },{ X: 188, Y: 215 },{ X: 186, Y: 212 },{ X: 183, Y: 211 },{ X: 177, Y: 208 },{ X: 169, Y: 206 },{ X: 162, Y: 205 },{ X: 154, Y: 207 },{ X: 145, Y: 209 },{ X: 137, Y: 210 },{ X: 129, Y: 214 },{ X: 122, Y: 217 },{ X: 118, Y: 218 },{ X: 111, Y: 221 },{ X: 109, Y: 222 },{ X: 110, Y: 219 },{ X: 112, Y: 217 },{ X: 118, Y: 209 },{ X: 120, Y: 207 },{ X: 128, Y: 196 },{ X: 135, Y: 187 },{ X: 138, Y: 183 },{ X: 148, Y: 167 },{ X: 157, Y: 153 },{ X: 163, Y: 145 },{ X: 165, Y: 142 },{ X: 172, Y: 133 },{ X: 177, Y: 127 },{ X: 179, Y: 127 },{ X: 180, Y: 125 })),
		new Template("left curly brace", new Array({ X: 150, Y: 116 },{ X: 147, Y: 117 },{ X: 145, Y: 116 },{ X: 142, Y: 116 },{ X: 139, Y: 117 },{ X: 136, Y: 117 },{ X: 133, Y: 118 },{ X: 129, Y: 121 },{ X: 126, Y: 122 },{ X: 123, Y: 123 },{ X: 120, Y: 125 },{ X: 118, Y: 127 },{ X: 115, Y: 128 },{ X: 113, Y: 129 },{ X: 112, Y: 131 },{ X: 113, Y: 134 },{ X: 115, Y: 134 },{ X: 117, Y: 135 },{ X: 120, Y: 135 },{ X: 123, Y: 137 },{ X: 126, Y: 138 },{ X: 129, Y: 140 },{ X: 135, Y: 143 },{ X: 137, Y: 144 },{ X: 139, Y: 147 },{ X: 141, Y: 149 },{ X: 140, Y: 152 },{ X: 139, Y: 155 },{ X: 134, Y: 159 },{ X: 131, Y: 161 },{ X: 124, Y: 166 },{ X: 121, Y: 166 },{ X: 117, Y: 166 },{ X: 114, Y: 167 },{ X: 112, Y: 166 },{ X: 114, Y: 164 },{ X: 116, Y: 163 },{ X: 118, Y: 163 },{ X: 120, Y: 162 },{ X: 122, Y: 163 },{ X: 125, Y: 164 },{ X: 127, Y: 165 },{ X: 129, Y: 166 },{ X: 130, Y: 168 },{ X: 129, Y: 171 },{ X: 127, Y: 175 },{ X: 125, Y: 179 },{ X: 123, Y: 184 },{ X: 121, Y: 190 },{ X: 120, Y: 194 },{ X: 119, Y: 199 },{ X: 120, Y: 202 },{ X: 123, Y: 207 },{ X: 127, Y: 211 },{ X: 133, Y: 215 },{ X: 142, Y: 219 },{ X: 148, Y: 220 },{ X: 151, Y: 221 })),
		new Template("right curly brace", new Array({ X: 117, Y: 132 },{ X: 115, Y: 132 },{ X: 115, Y: 129 },{ X: 117, Y: 129 },{ X: 119, Y: 128 },{ X: 122, Y: 127 },{ X: 125, Y: 127 },{ X: 127, Y: 127 },{ X: 130, Y: 127 },{ X: 133, Y: 129 },{ X: 136, Y: 129 },{ X: 138, Y: 130 },{ X: 140, Y: 131 },{ X: 143, Y: 134 },{ X: 144, Y: 136 },{ X: 145, Y: 139 },{ X: 145, Y: 142 },{ X: 145, Y: 145 },{ X: 145, Y: 147 },{ X: 145, Y: 149 },{ X: 144, Y: 152 },{ X: 142, Y: 157 },{ X: 141, Y: 160 },{ X: 139, Y: 163 },{ X: 137, Y: 166 },{ X: 135, Y: 167 },{ X: 133, Y: 169 },{ X: 131, Y: 172 },{ X: 128, Y: 173 },{ X: 126, Y: 176 },{ X: 125, Y: 178 },{ X: 125, Y: 180 },{ X: 125, Y: 182 },{ X: 126, Y: 184 },{ X: 128, Y: 187 },{ X: 130, Y: 187 },{ X: 132, Y: 188 },{ X: 135, Y: 189 },{ X: 140, Y: 189 },{ X: 145, Y: 189 },{ X: 150, Y: 187 },{ X: 155, Y: 186 },{ X: 157, Y: 185 },{ X: 159, Y: 184 },{ X: 156, Y: 185 },{ X: 154, Y: 185 },{ X: 149, Y: 185 },{ X: 145, Y: 187 },{ X: 141, Y: 188 },{ X: 136, Y: 191 },{ X: 134, Y: 191 },{ X: 131, Y: 192 },{ X: 129, Y: 193 },{ X: 129, Y: 195 },{ X: 129, Y: 197 },{ X: 131, Y: 200 },{ X: 133, Y: 202 },{ X: 136, Y: 206 },{ X: 139, Y: 211 },{ X: 142, Y: 215 },{ X: 145, Y: 220 },{ X: 147, Y: 225 },{ X: 148, Y: 231 },{ X: 147, Y: 239 },{ X: 144, Y: 244 },{ X: 139, Y: 248 },{ X: 134, Y: 250 },{ X: 126, Y: 253 },{ X: 119, Y: 253 },{ X: 115, Y: 253 })),
		new Template("star", new Array({ X: 75, Y: 250 },{ X: 75, Y: 247 },{ X: 77, Y: 244 },{ X: 78, Y: 242 },{ X: 79, Y: 239 },{ X: 80, Y: 237 },{ X: 82, Y: 234 },{ X: 82, Y: 232 },{ X: 84, Y: 229 },{ X: 85, Y: 225 },{ X: 87, Y: 222 },{ X: 88, Y: 219 },{ X: 89, Y: 216 },{ X: 91, Y: 212 },{ X: 92, Y: 208 },{ X: 94, Y: 204 },{ X: 95, Y: 201 },{ X: 96, Y: 196 },{ X: 97, Y: 194 },{ X: 98, Y: 191 },{ X: 100, Y: 185 },{ X: 102, Y: 178 },{ X: 104, Y: 173 },{ X: 104, Y: 171 },{ X: 105, Y: 164 },{ X: 106, Y: 158 },{ X: 107, Y: 156 },{ X: 107, Y: 152 },{ X: 108, Y: 145 },{ X: 109, Y: 141 },{ X: 110, Y: 139 },{ X: 112, Y: 133 },{ X: 113, Y: 131 },{ X: 116, Y: 127 },{ X: 117, Y: 125 },{ X: 119, Y: 122 },{ X: 121, Y: 121 },{ X: 123, Y: 120 },{ X: 125, Y: 122 },{ X: 125, Y: 125 },{ X: 127, Y: 130 },{ X: 128, Y: 133 },{ X: 131, Y: 143 },{ X: 136, Y: 153 },{ X: 140, Y: 163 },{ X: 144, Y: 172 },{ X: 145, Y: 175 },{ X: 151, Y: 189 },{ X: 156, Y: 201 },{ X: 161, Y: 213 },{ X: 166, Y: 225 },{ X: 169, Y: 233 },{ X: 171, Y: 236 },{ X: 174, Y: 243 },{ X: 177, Y: 247 },{ X: 178, Y: 249 },{ X: 179, Y: 251 },{ X: 180, Y: 253 },{ X: 180, Y: 255 },{ X: 179, Y: 257 },{ X: 177, Y: 257 },{ X: 174, Y: 255 },{ X: 169, Y: 250 },{ X: 164, Y: 247 },{ X: 160, Y: 245 },{ X: 149, Y: 238 },{ X: 138, Y: 230 },{ X: 127, Y: 221 },{ X: 124, Y: 220 },{ X: 112, Y: 212 },{ X: 110, Y: 210 },{ X: 96, Y: 201 },{ X: 84, Y: 195 },{ X: 74, Y: 190 },{ X: 64, Y: 182 },{ X: 55, Y: 175 },{ X: 51, Y: 172 },{ X: 49, Y: 170 },{ X: 51, Y: 169 },{ X: 56, Y: 169 },{ X: 66, Y: 169 },{ X: 78, Y: 168 },{ X: 92, Y: 166 },{ X: 107, Y: 164 },{ X: 123, Y: 161 },{ X: 140, Y: 162 },{ X: 156, Y: 162 },{ X: 171, Y: 160 },{ X: 173, Y: 160 },{ X: 186, Y: 160 },{ X: 195, Y: 160 },{ X: 198, Y: 161 },{ X: 203, Y: 163 },{ X: 208, Y: 163 },{ X: 206, Y: 164 },{ X: 200, Y: 167 },{ X: 187, Y: 172 },{ X: 174, Y: 179 },{ X: 172, Y: 181 },{ X: 153, Y: 192 },{ X: 137, Y: 201 },{ X: 123, Y: 211 },{ X: 112, Y: 220 },{ X: 99, Y: 229 },{ X: 90, Y: 237 },{ X: 80, Y: 244 },{ X: 73, Y: 250 },{ X: 69, Y: 254 },{ X: 69, Y: 252 })),
		new Template("pigtail", new Array({ X: 81, Y: 219 },{ X: 84, Y: 218 },{ X: 86, Y: 220 },{ X: 88, Y: 220 },{ X: 90, Y: 220 },{ X: 92, Y: 219 },{ X: 95, Y: 220 },{ X: 97, Y: 219 },{ X: 99, Y: 220 },{ X: 102, Y: 218 },{ X: 105, Y: 217 },{ X: 107, Y: 216 },{ X: 110, Y: 216 },{ X: 113, Y: 214 },{ X: 116, Y: 212 },{ X: 118, Y: 210 },{ X: 121, Y: 208 },{ X: 124, Y: 205 },{ X: 126, Y: 202 },{ X: 129, Y: 199 },{ X: 132, Y: 196 },{ X: 136, Y: 191 },{ X: 139, Y: 187 },{ X: 142, Y: 182 },{ X: 144, Y: 179 },{ X: 146, Y: 174 },{ X: 148, Y: 170 },{ X: 149, Y: 168 },{ X: 151, Y: 162 },{ X: 152, Y: 160 },{ X: 152, Y: 157 },{ X: 152, Y: 155 },{ X: 152, Y: 151 },{ X: 152, Y: 149 },{ X: 152, Y: 146 },{ X: 149, Y: 142 },{ X: 148, Y: 139 },{ X: 145, Y: 137 },{ X: 141, Y: 135 },{ X: 139, Y: 135 },{ X: 134, Y: 136 },{ X: 130, Y: 140 },{ X: 128, Y: 142 },{ X: 126, Y: 145 },{ X: 122, Y: 150 },{ X: 119, Y: 158 },{ X: 117, Y: 163 },{ X: 115, Y: 170 },{ X: 114, Y: 175 },{ X: 117, Y: 184 },{ X: 120, Y: 190 },{ X: 125, Y: 199 },{ X: 129, Y: 203 },{ X: 133, Y: 208 },{ X: 138, Y: 213 },{ X: 145, Y: 215 },{ X: 155, Y: 218 },{ X: 164, Y: 219 },{ X: 166, Y: 219 },{ X: 177, Y: 219 },{ X: 182, Y: 218 },{ X: 192, Y: 216 },{ X: 196, Y: 213 },{ X: 199, Y: 212 },{ X: 201, Y: 211 }))
	];
}

//
// The $1 Gesture Recognizer API begins here -- 3 methods
//
DollarRecognizer.prototype.Recognize = function (points, useProtractor) {
    points = Resample(points, NumPoints);
    var radians = IndicativeAngle(points);
    points = RotateBy(points, -radians);
    points = ScaleTo(points, SquareSize);
    points = TranslateTo(points, Origin);
    var vector = Vectorize(points); // for Protractor
    var b = +Infinity,
        t = 0,
        templates = this.Templates;

    for (var i = 0, len = templates.length; i < len; i++) // for each unistroke template
    {
        var d = OptimalCosineDistance(templates[i].Vector, vector);

        if (d < b) {
            b = d; // best (least) distance
            t = i; // unistroke template
        }
    }
    return new Result(templates[t].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
};

//
// add/delete new templates
//
DollarRecognizer.prototype.AddTemplate = function (name, points) {
    this.Templates[this.Templates.length] = new Template(name, points); // append new template
    var num = 0;
    for (var i = 0; i < this.Templates.length; i++) {
        if (this.Templates[i].Name == name) num++;
    }
    return num;
};


DollarRecognizer.prototype.DeleteUserTemplates = function () {
    this.Templates.length = NumTemplates; // clear any beyond the original set
    return NumTemplates;
};

//
// Private helper functions from this point down
//
function Resample(points, n) {
    var I = PathLength(points) / (n - 1),
        // interval length
        D = 0.0,
        newpoints = new Array(points[0]),
        d, q;

    for (i = 1; i < points.length; i++) {
        d = Distance(points[i - 1], points[i]);
        if ((D + d) >= I) {
            q = {
                X: (points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X)),
                Y: (points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y))
            };
            newpoints[newpoints.length] = q; // append new point 'q'
            points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
            D = 0.0;
        } else D += d;
    }
    // somtimes we fall a rounding-error short of adding the last point, so add it if so
    if (newpoints.length == n - 1) {
        newpoints[newpoints.length] = {
            X: points[points.length - 1].X,
            Y: points[points.length - 1].Y
        };
    }
    return newpoints;
}

function IndicativeAngle(points) {
    var c = Centroid(points);
    return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}

function RotateBy(points, radians) { // rotates points around centroid
    var c = Centroid(points),
        cos = Math.cos(radians),
        sin = Math.sin(radians),

        newpoints = [];

    for (var i = 0, len = points.length; i < len; i++) {
        newpoints[newpoints.length] = {
            X: ((points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X),
            Y: ((points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y)
        };
    }
    return newpoints;
}

function ScaleTo(points, size) { // non-uniform scale; assumes 2D gestures (i.e., no lines)
    var B = BoundingBox(points),
        newpoints = [];

    for (var i = 0, len = points.length; i < len; i++) {
        newpoints[newpoints.length] = {
            X: points[i].X * (size / B.Width),
            Y: points[i].Y * (size / B.Height)
        };
    }
    return newpoints;
}

function TranslateTo(points, pt) { // translates points' centroid
    var c = Centroid(points),
        newpoints = [];

    for (var i = 0, len = points.length; i < len; i++) {
        newpoints[newpoints.length] = {
            X: (points[i].X + pt.X - c.X),
            Y: (points[i].Y + pt.Y - c.Y)
        };
    }
    return newpoints;
}

function Vectorize(points) { // for Protractor
    var sum = 0.0,
        vector = [];

    for (var i = 0, len = points.length; i < len; i++) {
        vector[vector.length] = points[i].X;
        vector[vector.length] = points[i].Y;
        sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
    }
    var magnitude = Math.sqrt(sum);
    for (var i = 0; i < vector.length; i++)
    vector[i] /= magnitude;
    return vector;
}

function OptimalCosineDistance(v1, v2) { // for Protractor
    var a = 0.0;
    var b = 0.0;
    for (var i = 0; i < v1.length; i += 2) {
        a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
        b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
    }
    var angle = Math.atan(b / a);
    return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}

function Centroid(points) {
    var x = 0.0,
        y = 0.0;
    for (var i = 0, len = points.length; i < len; i++) {
        x += points[i].X;
        y += points[i].Y;
    }
    x /= points.length;
    y /= points.length;
    return {
        X: x,
        Y: y
    };
}

function BoundingBox(points) {
    var minX = +Infinity,
        maxX = -Infinity,
        minY = +Infinity,
        maxY = -Infinity;
    for (var i = 0, len = points.length; i < len; i++) {
        if (points[i].X < minX) minX = points[i].X;
        if (points[i].X > maxX) maxX = points[i].X;
        if (points[i].Y < minY) minY = points[i].Y;
        if (points[i].Y > maxY) maxY = points[i].Y;
    }
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}

function PathLength(points) {
    var d = 0.0;
    for (var i = 1; i < points.length; i++)
    d += Distance(points[i - 1], points[i]);
    return d;
}

function Distance(p1, p2) {
    var dx = p2.X - p1.X,
        dy = p2.Y - p1.Y;

    return Math.sqrt(dx * dx + dy * dy);
}

function Deg2Rad(d) {
    return (d * Math.PI / 180.0);
}

})(this, Math, Infinity);