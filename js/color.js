(function(){

d3.csv("colors.csv",function(error,csv){
	if(error) throw error;
	var r = 50;
	var colorObject = [];
	function rgbToCmyk(rgb){
		var r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255,
			k = 1 - Math.max(r, g, b);
		return{
			"c": (1 - r - k) / (1 - k),
			"m": (1 - g - k) / (1 - k),
			"y": (1 - b - k) / (1 - k),
			"k": k
		};
	}
	for(var i = 0; i < csv.length; i++){
		colorObject[i] = {};
		var temp = csv[i];
		colorObject[i]["name"] = temp["name"];
		colorObject[i]["pinyin"] = temp["pinyin"];
		colorObject[i]["hexColor"] = temp["hex"];
		colorObject[i]["rgbColor"] = {};
		colorObject[i]["rgbColor"]["r"] = d3.color(temp.hex).rgb()["r"];
		colorObject[i]["rgbColor"]["g"] = d3.color(temp.hex).rgb()["g"];
		colorObject[i]["rgbColor"]["b"] = d3.color(temp.hex).rgb()["b"];
		colorObject[i]["cmykColor"] = rgbToCmyk(colorObject[i]["rgbColor"]);
	}
	temp = null;
	var pie = d3.pie().sort(null);
	var cmykArray = ["c","m","y","k","r","g","b"];

// --------------左边画布，用来画每个颜色的细节--------------
	(function drawMainPart(){    
	var container = d3.select("body")
				      .append("div")
				      .attr("id","container")
				      .style("width","50%")
				      .style("margin-left","10%")
				      .style("margin-top","4%");
	var svg = d3.select("#container").selectAll(".set")
		.data(colorObject)
		.enter()
		.append("svg")
		.attr("class","set")
	    .attr("width", r * 2)
	    .attr("height", r * 6)
	    .attr("class","set")
	    .on("mouseover",setMouseOver)
	    .on("mouseout",setMouseOut)
	    .on("click",initBigArc);
	
	//画颜色的展示色块和rgb的条形图
	var rects = svg.append("rect")
				.attr("class","rect")
				.attr("width",r)
				.attr("height",r/8)
				.style("fill",function(d,i){
					var currentColor = d["rgbColor"];
					return "rgb(" + currentColor["r"] + "," + currentColor["g"] + "," + currentColor["b"] + ")";
				});
	function drawVerticalRect(x){
		var rectVertical = svg.append("rect")
						  .attr("class","rect_Vertical")
						  .attr("width","1px")
						  .attr("height",r*2.3)
						  .attr("y",2.9*r)
						  .attr("x",x)
						  .style("fill","rgba(255,255,255,0.4)");
	};
	drawVerticalRect(r/2.2);
	drawVerticalRect(r/2.2 + r/22 + 1);
	drawVerticalRect(r/2.2 + r/11 + 2);
	
	//画每个set下的空心饼图
	var color = d3.scaleOrdinal()
		.domain([0,1])
	    .range(["rgba(255,255,255,1)", "rgba(255,255,255,0.3)"]);
	var arc = d3.arc()
				 .outerRadius(r/4)
				 .innerRadius(r/8);
	
	function drawArcg(colorString,y){
		var arcg = svg.selectAll(".pie")
				.data(function(d){
						var firstColor = +d["cmykColor"][colorString];
					    var array = [firstColor,(1 - firstColor)];
						return pie(array);
					})
			   .enter()
			   .append("path")
			   .attr("class","color_" + colorString)
			   .attr("d",arc)
			   .style("stroke","none")
			   .attr("transform","translate(" + (r/3)  + "," + y + ")")
			   .style("fill",function(d,i){
			   		if(d.startAngle == 0) return color(0);
					return color(1);
				});
	}
	for(var i = 0; i < 4; i++){
		drawArcg(cmykArray[i], 0.6*r*(i+1));
	}
	//画文字
	var colorName = svg.append("text")
				  .attr("class","colorName")
				  .attr("writing-mode","tb-rl")
				  .text(function(d){
				  	return d["name"];
				  })
				  .attr("dy",".35em")
				  .attr("x",(r-4))
				  .attr("y",function(d,i){
				  	return (2.5 * r - this.getBBox().height);
				  })
				  .style("fill","#FFFFFF");
	var colorOrder = svg.append("text")
					    .attr("class","colorOrder")
					    .text(function(d,i){
					    	if((i+1).toString().length == 1) return "00" + (i + 1);
					    	if((i+1).toString().length == 2) return "0" + (i + 1);
					    	return i + 1;
					    })
					    .attr("dy",".35em")
					    .attr("transform","translate(" + (r-4) + "," + r/2 + ") rotate(90)")
					    .style("fill",function(d,i){
							var currentColor = d["rgbColor"];
							return "rgb(" + currentColor["r"] + "," + currentColor["g"] + "," + currentColor["b"] + ")";
						});
	var colorHex = svg.append("text")
					  .attr("class","colorHex")
					  .text(function(d){
					  	return d["hexColor"];
					  })
					  .attr("dy",".35em")
					  .style("font-size","0.8em")
					  .style("fill","#FFFFFF")
					  .attr("transform","translate(10" + "," + 2.9 * r + ") rotate(90)")		    
	var colorPinyin = svg.append("text")
						 .attr("class","colorPinyin")
						 .text(function(d){
						 	return d["pinyin"].toUpperCase();
						 })
						 .attr("dy",".35em")
						 .style("font-size","18px")
						 .style("fill","#FFFFFF")
						 .attr("transform","translate(46" + "," + 2.9 * r + ") rotate(90)");
	})();

	function setMouseOver(d){
		var parentSet = d3.select(this);
		parentSet.each(function(){
			var childrenOfSet = d3.selectAll(this.childNodes);
			for(var i = 0; i< childrenOfSet["_groups"][0].length; i++){
				var currentSvgPattern = childrenOfSet["_groups"][0][i];
				if(d3.select(currentSvgPattern).style("fill") === "rgb(255, 255, 255)"){
					d3.select(currentSvgPattern).style("fill",function(){
						return d.hexColor;
					})
				}
			}
		})
	}
	function setMouseOut(d){
		var parentSet = d3.select(this);
		parentSet.each(function(){
			var childrenOfSet = d3.selectAll(this.childNodes);
			for(var i = 0; i< childrenOfSet["_groups"][0].length; i++){
				var currentSvgPattern = childrenOfSet["_groups"][0][i];
				if((d3.select(currentSvgPattern).style("fill")).toString() == (d3.color(d.hexColor).rgb()).toString() ){
					var currentSvgClass = d3.select(currentSvgPattern).attr("class");
					if(currentSvgClass === "rect" || currentSvgClass === "colorOrder") continue;
					d3.select(currentSvgPattern).style("fill",function(){
						return "rgb(255, 255, 255)";
					})
				}
			}
		})
	}

// --------------右边画布，点击后呈现每个颜色放大的细节--------------
	var sidebar = d3.select("body")
					.append("div")
					.attr("id","sidebar")
					.style("width","30%")
					.style("height","100%")
					.style("margin-top","4%");
	var svgSide = d3.select("#sidebar")
						.append("svg")
						.attr("width",r*6)
						.attr("height", r * 13)
						.append("g");
	//画sidebar的矩形
	function appendRectToSide(y){
		var rectSide = svgSide.append("rect")
					.attr("width",r)
					.attr("height","1px")
					.attr("x","20%")
					.attr("y",y)
					.style("fill","#FFFFFF");
	}
	for(var i = 0; i < 5; i++){
		var heightBetweenRectHex = 1.7*r;
		appendRectToSide((heightBetweenRectHex * i).toString() + "px");
	}
	for(var j = 0; j < 3; j++){
		var heightBetweenRectRgb = 1.7 * r *4 ;
		appendRectToSide((heightBetweenRectRgb + (j+1) * r).toString() + "px");
	}
	function appendTextToSide(index,y1,y2){
		var smallTextSide = svgSide.append("text")
						.text(function(){
						 	return cmykArray[index].toUpperCase();
						 })
						 .attr("dy",".35em")
						 .style("fill","#FFFFFF")
						 .attr("transform",function(){
						 	return "translate("+1.2*r + "," + (y1 + y2*r*index) + ")"
						 });
	}
	for(var i = 0; i < 4; i++){
		appendTextToSide(i,r/4,1.7);
	}
	for(var i = 4; i < 7; i++){
		appendTextToSide(i,3.1*r,1);
	}

	var bigArc = d3.arc()
					 .outerRadius(r/2)
					 .innerRadius(r/2 - 2);
	function initBigArc(d){
		//画sidebar的pie
		d3.selectAll(".textBigArc").remove();
		d3.selectAll(".arcBig").remove();
		d3.selectAll(".rgbSideNumber").remove();
		d3.select("#nameSide").remove();
		d3.select("#pinyinSide").remove();
		d3.select("html").style("background-color",d.hexColor);
		function drawBigArc(colorString,y){
			var arcBg = svgSide.selectAll(".bigPie")
					   .data(function(){
						var firstColor = +d["cmykColor"][colorString];
					    var array = [firstColor,( 1 - firstColor )];
						return pie(array);
					   })
					  .enter()
					  .append("path")
					  .attr("class","arcBig")
					  .attr("d",bigArc)
					  .style("stroke","none")
					  .each(function(d) { this._current = d; })
					  .attr("transform","translate(" + 1.7*r + "," + y + ")" )
					  .transition()
			          .duration(500)
			          .ease(d3.easeLinear)
					  .attrTween("d", arcTween)
					  .style("fill",function(dt,i){
				   		if(dt.startAngle == 0){
				   			if(colorString === "c") return "#0093D3";
				   			if(colorString === "m") return "#CC006B";
				   			if(colorString === "y") return "#FFF10C";
				   			if(colorString === "k") return "#333";
				   		}
						return "rgba(255,255,255,0.3)";
					});
		}
		function drawTextToBigArc(){
			var textBigArc = svgSide.selectAll(".textBigArc")
									.data(d3.map(d["cmykColor"]).values())
									.enter()
									.append("text")
									.text(function(dt,i){
										return (dt*100).toFixed(0);
									})
									.attr("class","textBigArc")
									.style("font-size","1.5rem")
									.style("fill","#FFFFFF")
									.attr("text-anchor","middle")
									.attr("transform",function(dt,i){
										return "translate("+1.7*r + "," + (1.7*r*i+1.2*r) +")"
										});
			var rgbNumber = svgSide.selectAll(".rgbSideNumber")
								    .data(d3.map(d["rgbColor"]).values())
								    .enter()
									.append("text")
									.text(function(dt,i){
										return dt;
									})
									.attr("class","rgbSideNumber")
									.style("font-size","1.3rem")
									.style("fill","#FFFFFF")
									.attr("text-anchor","middle")
									.attr("transform",function(dt,i){
										return "translate("+1.9*r + "," + (r*i+7.6*r) +")"
										});
		}
		drawTextToBigArc();
		function drawNameSide(){
			var nameToSide = svgSide.append("text")
							.attr("id","nameSide")
							.text(function(){
								return d.name;
							})
							.attr("writing-mode","tb-rl")
							.style("fill","#FFFFFF")
							.style("font-size","4.5rem")
							.attr("transform","translate(" + 4.2*r + "," + 0.4*r + ")");
			var pinyinToSide = svgSide.append("text")
							.attr("id","pinyinSide")
							.text(function(){
								return d.pinyin.toUpperCase();
							})
							.style("fill","#FFFFFF")
							.style("font-size","1.7rem")
							.attr("text-anchor","middle")
							.attr("transform",function(){
								return "translate(" + 4.3*r + "," + 4.4*r + ")"
							});
		}
		drawNameSide();
		for(var i = 0; i < 4; i++){
			drawBigArc(cmykArray[i],(r+1.7*r*i));
		}
	}
	
	initBigArc(colorObject[50]);
	function arcTween(a) {
	  var i = d3.interpolate(this._current, a);
	  this._current = i(0);
	  return function(t) {
	    return bigArc(i(t));
	  };
	}
	
	})
}());
