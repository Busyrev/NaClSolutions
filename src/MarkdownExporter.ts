import mdToPdf from "md-to-pdf";

export class MarkdownExporter {
    public static async export(mdInput: string, html: boolean) {
        // https://stackoverflow.com/questions/907680/css-printing-avoiding-cut-in-half-divs-between-pages
        // padding: 5px 1px 5px 1px;
        // let css: string = `
        // table th,
        // table td {
        //     padding: 5px 1px 5px 1px;
        //     border: 1px solid gainsboro;
        // }
        // body {
        //     line-height: 1;
        // }
        // div {
        //     page-break-inside: avoid;
        // }
        // `;
        let css: string = `
        table th {
            padding: 5px 3px 5px 3px;
            border: 1px solid gainsboro;
        }
        div {
            page-break-inside: avoid;
        }
        `;
        //break-inside: avoid;
        const pdf = await mdToPdf({
            content: mdInput,
        }, {
            as_html: html as any,
            // page_media_type: 'print',
            css: css,
            pdf_options: {
                format: "A4",
                margin: {
                    top: 70,
                    left: 50,
                    right: 50,
                    bottom: 70
                }
            },
            marked_options: {
                breaks: true,
            }
        }).catch(console.error);
        if (pdf) {
            return pdf.content;
        }
        return null;
    }
}
