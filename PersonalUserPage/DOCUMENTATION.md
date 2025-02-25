---
title: PUP Documentation
---

<style>
  body {
    font-family: sans-serif;
    background-color: #161b22;
    color: #c9d1d9;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
  }

  h1,
  h2,
  h3 {
    color: #fff;
  }

  .info-tab {
    border: 1px solid #30363d;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .code-block {
    background-color: #21262d;
    color: #d7ba7d;
    padding: 10px;
    border-radius: 6px;
    font-family: monospace;
    overflow-x: auto;
    font-size: 14px;
    white-space: pre-wrap;
  }

  .filename-line {
    background-color: #30363d;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }

  .filename-line svg {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    fill: #737d88;
  }

  .filename {
    color: #c9d1d9;
    flex-grow: 1;
  }

  .status {
    color: #238636;
    font-weight: bold;
  }

  a {
    color: #58a6ff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .inline-code {
    background-color: #30363d;
    color: #c9d1d9;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }
</style>

# PUP Documentation

This Documentation is about the Personal User Page and how you can add / remove things.

<div class="info-tab">
  <h2>How to add another info card</h2>

  <p>
    You can easily add another info card by just adding the following code
    snippet to the body area as shown below.
  </p>

  <div class="filename-line">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        d="M6 2l12 0c1.1 0 2 .9 2 2l0 16c0 1.1-.9 2-2 2l-12 0c-1.1 0-2-.9-2-2l0-16c0-1.1.9-2 2-2zM6 4l0 16l12 0l0-16l-12 0z"
      />
    </svg>
    <span class="filename">index.html</span>
    <span class="status">Up to date</span>
  </div>

  <div class="code-block">
    <pre><code ><div class="info-tab">
    <div class="image">
      <img src="https://picsum.photos/200/300" alt="Profile Picture" />
    </div>
    <div class="info">
      <p><b>Important Info</b></p>
      <p>
        A creative and detail-oriented frontend developer with a passion
        for crafting intuitive and visually appealing user interfaces.
        Proficient in HTML, CSS, and JavaScript, with a deep
        understanding of React and responsive design principles.
        Committed to creating accessible and engaging user experiences.
        Eager to contribute to innovative projects and elevate user
        satisfaction.
      </p>
    </div>
  </div></code></pre>
  </div>

  <p>
    The function must be declared within
    <span class="inline-code">builtin.h</span>:
  </p>
</div>
