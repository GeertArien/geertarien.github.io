---
layout: post
title:  "Jekyll Theme Munky"
tags: jekyll html sass css rubygem javascript
sidebar: true
text: true
description: Gem based theme for static site generator Jekyll.
repo: jekyll-theme-munky
image: /assets/images/projects/jekyll-theme-munky.jpg
---

One of the first decisions I had to make, when creating this website, was what
[CMS] to use. I wanted to move away from WordPress, which I had used
before but felt a bit bloated to my taste, to something more lightweight. And
so, after doing some research, I finally decided to go with [Jekyll], a static
site generator. Jekyll has an extensive theme system that you can use to
customize your websites presentation. Now, instead of creating this website with
one of the pre-existing themes, I decided to work the other way around, starting
from scratch and finally publishing my own theme on [RubyGems] for others to
enjoy.

{% include image.html
name="logo.jpg"
caption="The logo for Munky theme, courtesy of Sharon Roovers."
alt="Munky theme logo"
%}

Static site generators, such as Jekyll, avoid using databases altogether.
Instead they use plain text files, written in a markup languages such as
[Markdown], and run them through a layout or a series of layout files. As a final
product, a static website is generated.

Munky theme comes with 7 such **layout files**:

- *default.html* &mdash; The base layout that lays the foundation for subsequent layouts.
- *home.html* &mdash; The layout for the landing-page, gives an overview of the last blogposts.
- *page.html* &mdash; The default layout, for pages such as the 404 error page.
- *post.html* &mdash; The layout for posts and projects.
- *about.html* &mdash; The layout for the about-page.
- *photography.html* &mdash; The layout for the photography-page.
- *projects.html* &mdash; The layout for the projects-page.

The aim was to create a lightweight theme that avoids as much javascript as
possible and to rely mainly on CSS for the presentation while still maintaining
high browser compatibility. When it comes to CSS, Jekyll provides built in
support for [Sass], a CSS extension language that allows us to do all kind of
funky stuff such as *using variables*:

{% highlight scss %}
$font-size:   18px;
$small-font-size:  $base-font-size * 0.8;

body {
  font: $small-font-size;
}

{% endhighlight %}

*Nesting CSS selectors*:

{% highlight scss %}
ul.github-buttons li {
  float: left;
  margin-left: 10px;

  &:first-of-type {
    margin-left: 0;
  }

  &:last-of-type {
    float: right;
  }
}
{% endhighlight %}

[And a whole bunch of other awesome features.][sass-guide]

Jekyll also has a plugin system which makes it very easy to add specific
functionality to your website. Although it's not a requirement for the theme to
work, Munky theme does provide strong integration with the
[jekyll-seo-tag plugin][jekyll-seo-tag] which adds metadata tags for search
engines and social networks.

For a more detailed overview of features, as well as installation and usage
instructions, please refer to the [documentation]. Munky theme is also
[available on RubyGems][rubygems-munky] for Jekyll 3.4 and later. As for a live
preview, well, you're looking at it right now!

[CMS]:            https://en.wikipedia.org/wiki/Content_management_system
[Jekyll]:         http://jekyllrb.com/
[RubyGems]:       https://rubygems.org/
[Markdown]:       https://en.wikipedia.org/wiki/Markdown
[Sass]:           http://sass-lang.com/
[sass-guide]:     http://sass-lang.com/guide
[jekyll-seo-tag]: https://github.com/jekyll/jekyll-seo-tag
[rubygems-munky]: https://rubygems.org/gems/jekyll-theme-munky
[documentation]:  https://github.com/GeertArien/jekyll-theme-munky/blob/master/README.md
