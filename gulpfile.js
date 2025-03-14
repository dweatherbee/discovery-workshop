import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import gulp from 'gulp';
import { deleteAsync } from 'del';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import through from 'through2';
import zip from 'gulp-zip';
import asciidoctor from 'asciidoctor';
import asciidoctorRevealJs from '@asciidoctor/reveal.js';
import connect from 'gulp-connect';
import glob from 'glob';
import minimist from 'minimist';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
import puppeteer from 'puppeteer';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync('./package.json'));

const Asciidoctor = asciidoctor();

asciidoctorRevealJs.register();

gulp.task('css', () => gulp.src(['cockroach*.{sass,scss}', 'github*.css'])
    .pipe(sass({}).on('error', sass.logError))
    .pipe(gulp.dest('build/assets/theme')))

gulp.task('revealjs', () => gulp.src(['node_modules/reveal.js/dist/**/*'])
    .pipe(gulp.dest('build/assets/reveal.js/dist')))

gulp.task('plugins', () => gulp.src(['node_modules/reveal.js/plugin/**/*'])
    .pipe(gulp.dest('build/assets/reveal.js/plugin')))

gulp.task('images', () => gulp.src(['images/**/*'], {encoding: false})
    .pipe(gulp.dest('build/assets/images')))

gulp.task('favicon', () => gulp.src(['favicon.ico'], {encoding: false})
    .pipe(gulp.dest('build')))

gulp.task('fonts', () => gulp.src('node_modules/source-sans-pro/**/*')
    .pipe(gulp.dest('build/assets/theme/fonts/source-sans-pro')))

gulp.task('create-docinfo', (done) => {
    const basePath = 'slides';
    const dayFolders = glob.sync(`${basePath}/day-*`);

    const createDocinfoFile = (folder, relativePath) => {
        const backgroundUrl = `background: url(${relativePath}assets/images/CockroachLabs_Logo-Mark_Full-Color-Dark-BG.svg);`;
        const homeUrl = relativePath ? `${relativePath}index.html` : 'index.html';
        const docinfoContent = `
        <a href="${homeUrl}" id="cockroachDBLogo" style="${backgroundUrl}
                            position: absolute;
                            background-repeat: no-repeat;
                            z-index: 1000;
                            bottom: 10px;
                            left: 10px;
                            width: 50px;
                            height: 60px;">
        </a>`;
        writeFileSync(folder, docinfoContent);
    };

    // Create the docinfo file at the root
    createDocinfoFile(`${basePath}/docinfo-revealjs.html`, '');

    // Create the docinfo file in each day folder
    dayFolders.forEach((folder) => {
        createDocinfoFile(`${folder}/docinfo-revealjs.html`, '../');
    });

    done();
});

// Task for building the root, student, and complete-course pages with assets/ paths
gulp.task('asciidoctor-root', () => gulp.src(['slides/index.adoc', 'slides/student.adoc', 'slides/complete-course.adoc'])
    .pipe(through.obj((vinylFile, encoding, callback) => {
        console.log('Processing ' + vinylFile.path);

        const relativePath = vinylFile.relative.replace(/\.adoc$/, '.html');

        let instructorOptions = {
            safe: 'safe',
            backend: 'revealjs',
            mkdirs: true,
            to_file: 'build/' + relativePath,
            attributes: {
                favicon: '',
                imagesdir: 'assets/',
                'source-highlighter': 'highlight.js',
                'highlightjs-theme': 'assets/theme/github.css',
                docinfo: 'shared',
                revealjsdir: 'assets/reveal.js',
                revealjs_customtheme: 'assets/theme/cockroachlabs-light.css',
                revealjs_margin: 0.04,
                revealjs_minScale: 0.2,
                revealjs_maxScale: 2.0,
                revealjs_hash: true,
                student: false,
                'experimental': '',
                'role=mark': 'mark',
                'icons': 'font'
            }
        };

        console.log('Converting ' + vinylFile.path + ' to ' + instructorOptions.to_file);
        Asciidoctor.convertFile(vinylFile.path, instructorOptions);

        if (relativePath === 'complete-course.html') {
            // Create student version of complete-course
            let studentOptions = JSON.parse(JSON.stringify(instructorOptions));
            studentOptions.attributes.student = true;
            studentOptions.to_file = 'build/student-complete-course.html';
            console.log('Converting ' + vinylFile.path + ' to ' + studentOptions.to_file);
            Asciidoctor.convertFile(vinylFile.path, studentOptions);
        }

        callback(null);
    }))
);

// Task for building subdirectory pages with relative paths
gulp.task('asciidoctor-subdir', () => gulp.src(['slides/day-*/chapter-*.adoc'])
    .pipe(through.obj((vinylFile, encoding, callback) => {
        console.log('Processing ' + vinylFile.path);

        const relativePath = vinylFile.relative.replace(/\.adoc$/, '.html');

        let instructorOptions = {
            safe: 'safe',
            backend: 'revealjs',
            mkdirs: true,
            to_file: 'build/' + relativePath,
            attributes: {
                favicon: '',
                imagesdir: '../assets/',
                'source-highlighter': 'highlight.js',
                'highlightjs-theme': '../assets/theme/github.css',
                docinfo: 'shared',
                revealjsdir: '../assets/reveal.js',
                revealjs_customtheme: '../assets/theme/cockroachlabs-light.css',
                revealjs_margin: 0.04,
                revealjs_minScale: 0.2,
                revealjs_maxScale: 2.0,
                revealjs_hash: true,
                student: false,
                'experimental': '',
                'role=mark': 'mark',
                'icons': 'font'
            }
        };

        console.log('Converting ' + vinylFile.path + ' to ' + instructorOptions.to_file);
        Asciidoctor.convertFile(vinylFile.path, instructorOptions);

        // Create student version of each chapter
        let studentOptions = JSON.parse(JSON.stringify(instructorOptions));
        studentOptions.attributes.student = true;
        studentOptions.to_file = 'build/' + relativePath.replace(/([^\/]+)$/, 'student-$1');
        console.log('Converting ' + vinylFile.path + ' to ' + studentOptions.to_file);
        Asciidoctor.convertFile(vinylFile.path, studentOptions);

        callback(null);
    }))
);

gulp.task('replace-showNotes', () => {
    return gulp.src('build/**/*.html')
        .pipe(through.obj((file, enc, cb) => {
            let content = file.contents.toString();

            // Use a regex to find the `showNotes` property and replace its value
            content = content.replace(/showNotes:\s*[^,]+/, 'showNotes: \'separate-page\'');

            file.contents = Buffer.from(content);
            cb(null, file);
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('clean', () => {
    return deleteAsync(['build', '*.zip'])
})

gulp.task('build', gulp.series(
    gulp.parallel('css', 'revealjs', 'plugins', 'images', 'favicon', 'fonts', 'create-docinfo'),
    gulp.parallel('asciidoctor-root', 'asciidoctor-subdir')/*,
    'replace-showNotes'*/
))

gulp.task('build-notes', gulp.series(
    gulp.parallel('css', 'revealjs', 'plugins', 'images', 'favicon', 'fonts', 'create-docinfo'),
    gulp.parallel('asciidoctor-root', 'asciidoctor-subdir'),
    'replace-showNotes'
))

gulp.task('package', () => gulp.src(['build/**/*'], { base: 'build/' })
    .pipe(zip(pkg.name + '.zip'))
    .pipe(gulp.dest('.')))

gulp.task('all', gulp.series('clean', 'build', 'package'))

gulp.task('default', gulp.series('build'))

gulp.task('reload', () => gulp.src(['build/index.html', 'build/student.html'])
    .pipe(connect.reload()))

gulp.task('serve', gulp.series('build', (done) => {
    connect.server({
        root: 'build',
        port: 8000,
        host: '0.0.0.0',
        livereload: true
    })

    gulp.watch([
        'css/**/*.{sass,scss}',
        '*.scss',
        'github*.css',
        '*.adoc',
        'images/**/*',
        'slides/**/*.adoc',
        '!node_modules/**',
        '!README.adoc'
    ], gulp.series('build', 'reload'));

    done();

}));

// Task to generate index.html with "Hello, World." to test out the GH pages without sensitive info
gulp.task('hello-world', gulp.series('clean', (done) => {
    const buildDir = 'build';
    const filePath = join(buildDir, 'index.html');
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hello</title>
        </head>
        <body>
          <h1>Hello, World.</h1>
        </body>
      </html>
    `;

    // Ensure the build directory exists
    if (!existsSync(buildDir)) {
        mkdirSync(buildDir);
    }

    // Write the index.html file
    writeFileSync(filePath, content);

    done();
}));

// PDF generation helper function
async function generatePdf(htmlFile, outputFile) {
    console.log(`Starting PDF conversion from HTML: ${htmlFile}`);

    try {
        // Launch browser
        const browser = await puppeteer.launch({
            headless: 'new'
        });

        // Create new page
        const page = await browser.newPage();

        // Construct absolute file URL with print-pdf parameter
        const absolutePath = resolve(process.cwd(), 'build', htmlFile);
        const fileUrl = `file://${absolutePath}?print-pdf`;
        console.log(`Loading URL: ${fileUrl}`);

        // Go to page and wait for network to be idle
        await page.goto(fileUrl, {
            waitUntil: ['networkidle0', 'domcontentloaded']
        });

        // Wait for reveal.js to be fully loaded
        await page.waitForFunction(() => {
            return typeof Reveal !== 'undefined' && Reveal.isReady();
        });

        // Generate PDF
        await page.pdf({
            path: outputFile,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.4in',
                right: '0.4in',
                bottom: '0.4in',
                left: '0.4in'
            }
        });

        await browser.close();
        console.log(`Completed PDF conversion: ${outputFile}`);
        return true;
    } catch (error) {
        console.error(`Error generating PDF for ${htmlFile}:`);
        console.error(error);
        throw error;
    }
}

// Task to create output directory
gulp.task('create-pdf-dir', (done) => {
    if (!existsSync('build/pdf')) {
        mkdirSync('build/pdf', { recursive: true });
    }
    done();
});

// Task to generate instructor and student PDFs
gulp.task('generate-pdfs', (done) => {
    const argv = minimist(process.argv.slice(2));
    let day = argv.day;
    let chapter = argv.chapter;

    // Pad numbers with leading zeros if needed
    if (day && !isNaN(day)) {
        day = day.toString().padStart(2, '0');
    }
    if (chapter && !isNaN(chapter)) {
        chapter = chapter.toString().padStart(2, '0');
    }

    let files = [];

    if (day && chapter) {
        // Single chapter
        files.push(`day-${day}/chapter-${chapter}-course.html`);
    } else if (day) {
        // All chapters in a day
        files = glob.sync(`day-${day}/chapter-*.html`, { cwd: 'build' });
    } else {
        // No day specified - use complete course files
        files = ['complete-course.html'];
    }

    if (files.length === 0) {
        console.log('No matching files found');
        done();
        return;
    }

    console.log(`Found ${files.length} files to process`);

    (async () => {
        try {
            for (const file of files) {
                const baseName = file.replace(/\.html$/, '');
                const pdfDir = 'build/pdf';

                // Create the day directory if this is a chapter file
                if (file.includes('/')) {
                    const dayDir = join(pdfDir, file.split('/')[0]);
                    if (!existsSync(dayDir)) {
                        mkdirSync(dayDir, { recursive: true });
                    }
                }

                console.log(`\nProcessing ${baseName}`);

                // Generate instructor version
                await generatePdf(
                    file,
                    `${pdfDir}/${baseName}.pdf`
                );

                // Generate student version - just change 'chapter-' to 'student-chapter-'
                const studentHtml = file.replace('chapter-', 'student-chapter-');
                const studentPdfPath = `${pdfDir}/${baseName.replace('chapter-', 'student-chapter-')}.pdf`;

                await generatePdf(
                    studentHtml,
                    studentPdfPath
                );
            }
            console.log('\nAll PDF conversions completed successfully');
            done();
        } catch (error) {
            console.error('\nPDF generation failed:', error);
            done(error);
        }
    })();
});

// Main PDF build task that runs in sequence
gulp.task('build-instructor-pdf',
    gulp.series(
        'build-notes',  // First build the HTML files with speaker notes
        'create-pdf-dir',
        'generate-pdfs'
    )
);