#!/usr/bin/env node

const fs = require("fs");
const program = require('commander')
const colors = require('colors');
const path = require("path");
var cmdtype = "wx";


const cmdPath = process.cwd();
const beginSearchFile = (type, curDirPath) => {
	type = type ? type : cmdtype;
	curDirPath = curDirPath ? curDirPath : cmdPath;
	fs.readdir(curDirPath, (err, filelist) => {
		filelist.forEach((o, i) => {
			let curFilePath = curDirPath + '/' + o;
			if (o.indexOf(".") != -1) {
				readHtmlFile(curFilePath, o, type);
			} else {
				//获取当前文件的绝对路径
				var filedir = path.join(curDirPath, o);
				//根据文件路径获取文件信息，返回一个fs.Stats对象
				fs.stat(filedir, function(err, stats) {
				  if (err) {
					console.err("获取文件stats失败");
				  } else {
					var isFile = stats.isFile(); //是文件
					var isDir = stats.isDirectory(); //是文件夹
					if (isFile) {
						readHtmlFile(filedir + '/' + o, o, type, filedir);
					} else if (isDir) {
						beginSearchFile(cmdtype ,filedir); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
					}
				  }
				});
			  }
		})

	})
}
const html2wxml = initcode => {
	return new Promise((resolve, reject) => {
		initcode = initcode.replace(
			/<div |<p |<table |<tr |<ul |<dl |<h1 |<h2 |<h3 |<h4 |<h5 |<h6 |<nav |<head |<header |<footer |<article |<aside /gi,
			"<view "
		);
		initcode = initcode.replace(
			/<div>|<p>|<table>|<tr>|<ul>|<dl>|<h1>|<h2>|<h3>|<h4>|<h5>|<h6>|<nav>|<head>|<header>|<footer>|<article>|<aside>/gi,
			"<view>"
		);
		initcode = initcode.replace(
			/<\/div>|<\/p>|<\/table>|<\/tr>|<\/ul>|<\/dl>|<\/h1>|<\/h2>|<\/h3>|<\/h4>|<\/h6>|<\/h6>|<\/nav>|<\/head>|<\/header>|<\/footer>|<\/article>|<\/aside>/gi,
			"</view>"
		);

		initcode = initcode.replace(/textarea/gi, "rich-text");

		initcode = initcode.replace(/<span |<th |<td |<li |<dt /gi, "<text ");
		initcode = initcode.replace(/<a href/gi, "<navigator url");
		initcode = initcode.replace(/<\/a>/gi, "</navigator>");

		initcode = initcode.replace(/<br>/gi, "");

		initcode = initcode.replace(
			/<span>|<th>|<td>|<li>|<dt>/gi,
			"<text>"
		);
		initcode = initcode.replace(
			/<\/span>|<\/th>|<\/td>|<\/li>|<\/dt>/gi,
			"</text>"
		);

		initcode = initcode.replace(/<img /gi, "<image ");
		initcode = initcode.replace(/<img>/gi, "<image>");
		initcode = initcode.replace(/\/>/gi, "></image>");

		initcode = initcode.replace(/onclick/gi, "bindtap");
		// 标签里面含有样式rpx
		var reg1 = /-?\d+(\.\d+)?px/gi;
		var reg2 = /-?\d+px/gi;
		var reg3 = /-?\d+(\.\d+)?rem/gi;
		var reg4 = /-?\d+rem/gi;
		initcode = replaceAll(reg1, initcode, 2, "rpx");
		initcode = replaceAll(reg2, initcode, 2, "rpx");
		initcode = replaceAll(reg3, initcode, 100, "rpx");
		initcode = replaceAll(reg4, initcode, 100, "rpx");
		resolve(initcode);
	})
}
const rem2rpx = cssString => {
	return new Promise((resolve, reject) => {
		var reg,
			result,
			st,
			ed;

		reg = new RegExp(/(\d+\.\d+|\.\d+|\d)rem/g);

		// rem 单位的值转换为 rpx
		while ((result = reg.exec(cssString)) != null) {
			(st = result.index), (ed = reg.lastIndex);
			var matchedValue = Number(cssString.slice(st, ed - 3));
			// 16 为 html 的 font-size
			// 多了一个 "* 2" 是由于除发现页之外, 之前所有页面使用的 rem 都是基于 375 的设计稿开发的(750/2)
			var rpxValue = matchedValue * 50 * 2;
			cssString = cssString.split("");
			cssString.splice(st, ed - st, rpxValue + "rpx");
			cssString = cssString.join("");

		}
		if (!(result = reg.exec(cssString))) {
			resolve(cssString)
		}


	})
}
const wxml2html = initcode => {
	return new Promise((resolve, reject) => {
		initcode = initcode.replace(
			/<view |<scroll-view |<cover-view |<swiper |<swiper-item |<checkbox-group |<radio-group /gi,
			"<div "
		);
		initcode = initcode.replace(
			/<view>|<scroll-view>|<cover-view>|<swiper>|<swiper-item>|<checkbox-group>|<radio-group>/gi,
			"<div>"
		);
		initcode = initcode.replace(
			/<\/view>|<\/scroll-view>|<\/cover-view>|<\/swiper>|<\/swiper-item>|<\/checkbox-group>|<\/radio-group>/gi,
			"</div>"
		);

		initcode = initcode.replace(/<text /gi, "<span ");
		initcode = initcode.replace(/<text>/gi, "<span>");
		initcode = initcode.replace(/<\/text>/gi, "</span>");

		initcode = initcode.replace(/<checkbox /gi, '<input type="checkbox" ');
		initcode = initcode.replace(/<checkbox>/gi, '<input type="checkbox"> ');
		initcode = initcode.replace(/<\/checkbox>/gi, "");
		initcode = initcode.replace(/<radio /gi, '<input type="radio" ');
		initcode = initcode.replace(/<radio>/gi, '<input type="radio"> ');
		initcode = initcode.replace(/<\/radio>/gi, "");

		initcode = initcode.replace(/<image |<cover-image /gi, "<img ");
		initcode = initcode.replace(/<image>|<cover-image>/gi, "<img>");
		initcode = initcode.replace(/<\/image>|<\/cover-image>/gi, "");

		initcode = initcode.replace(/<navigator url/gi, "<a href");
		initcode = initcode.replace(/<\/navigator>/gi, "</a>");

		initcode = initcode.replace(/bindtap/gi, "onclick");

		initcode = initcode.replace(/rich-text/gi, "textarea");

		// 标签里面含有样式px
		var reg1 = /-?\d+(\.\d+)?rpx/gi;
		var reg2 = /-?\d+rpx/gi;
		initcode = replaceAll(reg1, initcode, 0.5, "px");
		initcode = replaceAll(reg2, initcode, 0.5, "px");
		resolve(initcode);
	})
}
const rpx2rem = cssString => {
	return new Promise((resolve, reject) => {
		var reg,
			result,
			st,
			ed;

		reg = new RegExp(/(\d+\d+|\d+|\d)rpx/g);

		// rem 单位的值转换为 rpx
		while ((result = reg.exec(cssString)) != null) {
			(st = result.index), (ed = reg.lastIndex);
			var matchedValue = Number(cssString.slice(st, ed - 3));
			// 16 为 html 的 font-size
			// 多了一个 "* 2" 是由于除发现页之外, 之前所有页面使用的 rem 都是基于 375 的设计稿开发的(750/2)
			var rpxValue = matchedValue / 50 / 2;
			cssString = cssString.split("");
			cssString.splice(st, ed - st, rpxValue + "rem");
			cssString = cssString.join("");
		}
		if (!(result = reg.exec(cssString))) {
			resolve(cssString)
		}
	})
}
const readHtmlFile = (curFilePath, filename, type) => {
	let fileExtension = filename.split(".")[1];
	fs.readFile(curFilePath, 'utf-8', (err, data) => {
		if (err) {
			console.log(colors.cyan(`读取${curFilePath}文件发生错误`))
			return;
		} else {
			if(type == "wx"){
				if (fileExtension == "html") {
					html2wxml(data).then(res => {
						writeAndRenameFile(filename, res, 'wxml', curFilePath);
					})
				} else if (fileExtension == "css") {
					rem2rpx(data).then(res => {
						writeAndRenameFile(filename, res, 'wxss', curFilePath);
					})
				} 
			}else if(type == "web"){
				if (fileExtension == "wxml") {
					wxml2html(data).then(res => {
						writeAndRenameFile(filename, res, 'html', curFilePath);
					})
				} else if (fileExtension == "wxss") {
					rpx2rem(data).then(res => {
						writeAndRenameFile(filename, res, 'css', curFilePath);
					})
				}
			}
		}
	})
}

const writeAndRenameFile = (filename, res, chagesExtension, curFilePath) => {
	fs.writeFile(curFilePath, res, (err) => {
		if (err) throw err;
		console.log(colors.cyan(`${filename}文件转换成功`))
		fs.rename(curFilePath, `${curFilePath.split("/")[0] + '\\' + filename.split(".")[0]}.${chagesExtension}`, (err) => {
			if (err) console.log(colors.cyan(`${curFilePath}文件重命名失败`));
		});
	})
}

// 按照正则reg把target找出并用replace按照scale（和unit单位）批量替换掉 
const replaceAll = (reg, target, scale, unit) => {
	var result = target.match(reg);
	for (var i in result) {
		target = target.replace(
			result[i],
			parseFloat(result[i]) * scale + unit
		);
	}
	return target;
}




program
	.version('1.0.35', '-v, --version')
	.command('run <type>')
	.action( function(type) {
		cmdtype = type;
		beginSearchFile(type);
	})
program.parse(process.argv)