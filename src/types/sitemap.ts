export type SitemapSection = {
    title: string;
    links: Array<{
        name: string;
        url: string;
    }>;
};

export type Sitemap = {
    sections: Array<SitemapSection>;
};