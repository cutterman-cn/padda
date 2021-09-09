
const gulp = require('gulp');
const path = require('path');
const ts = require('gulp-typescript');
const manifest = require('./package.json');
const env = require('./src/config/env.json');
const process = require('child_process');
const fs = require('fs');
const moment = require('moment');


const extension_root = "/Users/xiaoqiang/Library/Application Support/Adobe/CEP/extensions";
const extension_name = "com.cutterman.padda";
const extension_dir = path.join(extension_root, extension_name);

var version                 = manifest.version;
var package_name            = 'com.cutterman.padda';
const win_output = `Padda_win_${manifest.version}_${today()}`;
const mac_output = `Padda_mac_${manifest.version}_${today()}`;
var build_dir               = path.join(__dirname, 'build'),
    release_dir             = path.join(__dirname, 'dist'),
    package_dir             = path.join(release_dir, package_name),
    sign_output             = path.join(release_dir, 'sign', package_name),
    zxp_file                = path.join(release_dir, package_name + '.zip'),
    zip_file                = package_name + '_panel_' + version + '_' + today() + '.zip';


const root = path.join(__dirname);

gulp.task('update_build_num', async () => {
    env.version = manifest.version;
    env.build += 1;
    env.production = true;
    fs.writeFileSync(path.join(__dirname, 'src', 'config', 'env.json'), JSON.stringify(env, null, 4));
    console.log(`release version[${env.version}] build[${env.build}]`);
});

gulp.task(`jsx`, async () => {
    gulp.src("build/**/*").pipe(gulp.dest(path.join(extension_dir, "Panel")));
    gulp.src("src/jsx/*").pipe(gulp.dest(path.join(extension_dir, "Panel", "jsx")));
    gulp.src(".debug").pipe(gulp.dest(path.join(extension_dir)));
    gulp.src("CSXS/*").pipe(gulp.dest(path.join(extension_dir, "CSXS")));
    gulp.src("public/outer.html").pipe(gulp.dest(path.join(extension_dir, "Panel")));
});

gulp.task('package_panel', async () => {
    const release_dir = path.join(root, 'dist');
    const target = path.join(release_dir, extension_name);
    run(`rm -rf ${release_dir}; mkdir -p ${target}/Panel`);
    gulp.src("public/**/*").pipe(gulp.dest(path.join(target, "Panel")));
    gulp.src("build/**/*").pipe(gulp.dest(path.join(target, "Panel")));
    gulp.src("CSXS/*").pipe(gulp.dest(path.join(target, "CSXS")));
    gulp.src(".debug").pipe(gulp.dest(path.join(target)));
    gulp.src("src/jsx/*").pipe(gulp.dest(path.join(target, "Panel", "jsx")));

    //run(`cd release; zip -r ${extension_name}_${env.build}.zip ${extension_name}`);
});

gulp.task('package_win', async function() {
    await run(`/usr/local/bin/makensis -DOutFileName=${release_dir}/${package_name}.exe -DPanelPacakgeName=${sign_output} package.nsi`);
    await run(`cd ${release_dir}; zip -qr ${release_dir}/${win_output}.zip ${package_name}.exe`);
});

gulp.task('package_mac', async function() {
    await run(`/usr/local/bin/packagesbuild package.pkgproj`);
    const zip = `cd ${release_dir}; zip ${release_dir}/${mac_output}.zip ${package_name}.pkg`;
    await run(zip);
});

gulp.task('sign', async () => {
    await run(`mkdir -p ${sign_output}`);
    await run('/Users/xiaoqiang/Bin/zxp/ZXPSignCmd -sign '+ package_dir +' '+ zxp_file + ' /Users/xiaoqiang/Bin/zxp/cert.p12 04041029');
    await run('unzip -q '+ zxp_file +' -d ' + sign_output);
});

gulp.task('release', gulp.series('package_panel', 'sign', 'package_win', 'package_mac'));

function run(command) {
    return new Promise((resolve, reject) => {
        process.exec(command, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function today() {
    return moment().format(`YYYYMMDDHHmmss`);
}

gulp.task('watch', () => {
    gulp.watch(['src/jsx/*', 'public/*', "CSXS/*"], gulp.series('jsx'));
})