import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { writings } from './writings'
import './styles.css'

const projects = [
  {
    title: 'flowtic',
    href: 'https://github.com/PrAsAnNaRePo',
    type: 'open source · agents',
    year: '2025',
    summary: 'a small multi-agent workflow library for routing messages without a heavy orchestration layer.',
    details: [
      'direct syntax for configuring message routing',
      'isolated sessions with conversation and image history',
      'a tool system where functions can be defined once and called by agents',
      'litellm support for working with any model provider',
    ],
    stack: 'python · agents · litellm',
  },
  {
    title: 'nape-0',
    href: 'https://github.com/PrAsAnNaRePo',
    type: 'research · language models',
    year: '2024',
    summary: 'a compact language model series designed to get useful performance without a giant deployment footprint.',
    details: [
      'trained on 4× a6000s in roughly five hours',
      'focused on making language models computationally easy to deploy',
      '39,125 downloads on hugging face',
    ],
    stack: 'python · pytorch · transformers',
  },
  {
    title: 'adeos',
    href: 'https://github.com/PrAsAnNaRePo',
    type: 'client work · document intelligence',
    year: '2024—26',
    summary: 'an engineering document intelligence platform for manufacturing teams.',
    details: [
      'fastapi services for ballooning and bom extraction',
      'gpu inference pipelines for ocr and vision-language models',
      'dockerized services for repeatable production deployments',
    ],
    stack: 'python · fastapi · ocr · gpu inference',
  },
  {
    title: 'chatft',
    href: 'https://github.com/PrAsAnNaRePo',
    type: 'open source · fine-tuning',
    year: '2024',
    summary: 'a toolkit for training chatbots on whatsapp conversations, with control over how the dataset is shaped.',
    details: [
      'supports fine-tuning llms with a focus on qwen models',
      'customizable preprocessing for message depth and sample size',
      'integrated unsloth, weights & biases, and hugging face',
    ],
    stack: 'python · unsloth · transformers',
  },
]

const navItems = [
  { id: 'home', label: 'home', icon: '⌂' },
  { id: 'about', label: 'about', icon: '◌' },
  { id: 'work', label: 'work', icon: '▧' },
  { id: 'notes', label: 'notes', icon: '✎' },
  { id: 'contact', label: 'contact', icon: '↗' },
]

function track(event, properties = {}) {
  if (typeof window !== 'undefined' && window.posthog?.capture) {
    window.posthog.capture(event, properties)
  }
  if (import.meta.env.DEV) {
    console.info(`[analytics] ${event}`, properties)
  }
}

function ArrowUpRight() {
  return <span aria-hidden="true" className="arrow">↗</span>
}

function GithubIcon() {
  return <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6-.01c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" /></svg>
}

function XIcon() {
  return <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.24 2H21.9l-7.99 9.13L23.3 22h-7.2l-5.64-7.37L4 22H.34l8.55-9.77L.7 2h7.38l5.1 6.73L18.24 2Zm-1.28 17.94h2.03L6.99 3.94H4.81l12.15 16Z" /></svg>
}

function EmailIcon() {
  return <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M3.5 5.5h17v13h-17zM4 6l8 6 8-6" /></svg>
}

function WritingBlocks({ blocks }) {
  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const Heading = block.level === 2 ? 'h2' : 'h3'
          return <Heading key={`${block.text}-${index}`}>{block.text}</Heading>
        }
        if (block.type === 'list') {
          const List = block.ordered ? 'ol' : 'ul'
          return <List key={`list-${index}`}>{block.items.map((item) => <li key={item}>{item}</li>)}</List>
        }
        if (block.type === 'code') {
          return <pre key={`code-${index}`}><code>{block.lines.join('\n')}</code></pre>
        }
        if (block.type === 'image') {
          return <figure className="article-figure" key={`image-${index}`}><img src={block.src} alt={block.alt} loading="lazy" />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>
        }
        return <p key={`paragraph-${index}`}>{block.text}</p>
      })}
    </div>
  )
}

function App() {
  const [activeProject, setActiveProject] = useState(null)
  const [activeWriting, setActiveWriting] = useState(null)
  const [formStatus, setFormStatus] = useState('idle')
  const [selectedNav, setSelectedNav] = useState('home')
  const [genieTarget, setGenieTarget] = useState(null)

  const goTo = (id) => {
    setSelectedNav(id)
    setGenieTarget(null)
    window.requestAnimationFrame(() => setGenieTarget(id))
    window.setTimeout(() => setGenieTarget(null), 850)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    track('navigation_clicked', { destination: id })
  }

  const toggleProject = (title) => {
    setActiveProject((current) => (current === title ? null : title))
    track('project_opened', { project: title })
  }

  const openWriting = (slug) => {
    setActiveWriting(writings.find((writing) => writing.slug === slug) ?? null)
    track('writing_opened', { writing: slug })
  }

  const handleContactSubmit = async (event) => {
    event.preventDefault()
    setFormStatus('sending')

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('form-name', 'contact')
    const encoded = new URLSearchParams()

    for (const [key, value] of formData.entries()) {
      encoded.append(key, value)
    }

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encoded.toString(),
      })

      if (!response.ok) throw new Error('form submission failed')

      form.reset()
      setFormStatus('sent')
      track('contact_form_submitted')
    } catch {
      setFormStatus('error')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <nav className="main-nav" aria-label="main navigation">
          <p className="nav-label">pages</p>
          {navItems.map((item) => (
            <button className={`nav-item ${selectedNav === item.id ? 'is-selected' : ''}`} key={item.id} onClick={() => goTo(item.id)}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="socials">
            <a href="https://github.com/PrAsAnNaRePo" target="_blank" rel="noreferrer" aria-label="github"><GithubIcon /><span>github</span></a>
            <a href="https://x.com/prasanna448" target="_blank" rel="noreferrer" aria-label="x"><XIcon /><span>x</span></a>
            <a href="mailto:prasannatwenty@gmail.com" aria-label="email"><EmailIcon /><span>email</span></a>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <section className={`hero section-anchor ${genieTarget === 'home' ? 'genie-landing' : ''}`} id="home">
          <div className="hero-copy">
            <div className="eyebrow-row"><span className="dot" /> <span>hello,</span> <strong className="hero-name">i'm prasanna</strong></div>
            <h1>i build and deploy<br /><em>models for products.</em></h1>
            <p className="hero-lede">ai/ml engineer and curious builder across product thinking, ai model training, and designing backend systems.</p>
            <div className="hero-actions">
              <button className="button button-dark" onClick={() => goTo('work')}>see what i've built <ArrowUpRight /></button>
              <button className="text-button" onClick={() => goTo('contact')}>say hello <ArrowUpRight /></button>
            </div>
          </div>
          <div className="hero-note" aria-label="a note about prasanna">
            <div className="note-pin" />
            <p className="note-label">a note to self</p>
            <p className="note-quote">“you have power over your mind,<br />not outside. realize this,<br />and you will find strength.”</p>
            <div className="scribble">✳</div>
            <p className="note-signature">— marcus aurelius</p>
          </div>
        </section>

        <section className={`content-section section-anchor ${genieTarget === 'about' ? 'genie-landing' : ''}`} id="about">
          <div className="section-heading">
            <div><span className="section-index">01 /</span><h2>a little about me</h2></div>
            <span className="section-aside">the short version</span>
          </div>
          <div className="about-layout">
            <p className="about-lead">i like building things end to end — from figuring out what should exist to getting the low-level implementation working in production.</p>
            <div className="about-body">
              <p>my work sits at the intersection of ai/ml and backend engineering. i train models, design inference systems, and package the useful parts into tools people can actually use.</p>
              <p>i enjoy the space between a research paper and a working product: the experiments, the constraints, and the small decisions that make a system feel dependable.</p>
              <div className="skill-strip"><span>Python</span><span>C</span><span>Pytorch</span><span>FastAPI</span><span>Docker</span><span>GPU Infra</span></div>
            </div>
          </div>
        </section>

        <section className={`content-section section-anchor ${genieTarget === 'work' ? 'genie-landing' : ''}`} id="work">
          <div className="section-heading">
            <div><span className="section-index">02 /</span><h2>things i've built</h2></div>
            <span className="section-aside">selected work · 2023—26</span>
          </div>
          <div className="project-list">
            {projects.map((project, index) => {
              const isOpen = activeProject === project.title
              return (
                <article className={`project-card ${isOpen ? 'is-open' : ''}`} key={project.title}>
                  <button className="project-summary" onClick={() => toggleProject(project.title)} aria-expanded={isOpen}>
                    <span className="project-number">0{index + 1}</span>
                    <span className="project-main"><strong>{project.title}</strong><span>{project.type}</span></span>
                    <span className="project-year">{project.year}</span>
                    <span className="project-toggle" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="project-detail">
                      <p>{project.summary}</p>
                      <ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                      <div className="project-detail-actions">
                        <span className="project-stack">{project.stack}</span>
                        <a className="project-link" href={project.href} target="_blank" rel="noreferrer" onClick={() => track('project_link_clicked', { project: project.title })}>view project <ArrowUpRight /></a>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
          <div className="project-footer"><span>more experiments are hiding in the repo</span><a href="https://github.com/PrAsAnNaRePo" target="_blank" rel="noreferrer">visit github <ArrowUpRight /></a></div>
        </section>

        <section className={`content-section notes-section section-anchor ${genieTarget === 'notes' ? 'genie-landing' : ''}`} id="notes">
          <div className="section-heading">
            <div><span className="section-index">03 /</span><h2>writtings</h2></div>
            <span className="section-aside">three articles</span>
          </div>
          {activeWriting ? (
            <article className="reading-view" id="writing-reader">
              <button className="back-button" type="button" onClick={() => setActiveWriting(null)}>← back to writings</button>
              <div className="reading-header">
                <div>
                  <div className="blog-meta"><span>{activeWriting.date}</span><span>{activeWriting.readTime}</span></div>
                  <span className="blog-tag">{activeWriting.tag}</span>
                  <h1>{activeWriting.title}</h1>
                  <p>{activeWriting.summary}</p>
                </div>
                <img className="reading-image" src={activeWriting.image} alt="" />
              </div>
              <WritingBlocks blocks={activeWriting.blocks} />
              <div className="reading-footer"><span>originally published on {activeWriting.date}</span><a href={activeWriting.href} target="_blank" rel="noreferrer">view source <ArrowUpRight /></a></div>
            </article>
          ) : (
            <div className="notes-board">
              {writings.map((writing) => (
                <button className="blog-card" type="button" key={writing.slug} onClick={() => openWriting(writing.slug)}>
                  <div className="blog-image-wrap"><img className="blog-image" src={writing.image} alt="" loading="lazy" /></div>
                  <div className="blog-card-body">
                    <div className="blog-meta"><span>{writing.date}</span><span>{writing.readTime}</span></div>
                    <span className="blog-tag">{writing.tag}</span>
                    <h3>{writing.title}</h3>
                    <p>{writing.summary}</p>
                    <span className="blog-link">read article <ArrowUpRight /></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="services-band">
          <div><span className="section-index">04 /</span><h2>ways i can help</h2></div>
          <p>from a model that needs shipping to a backend that needs untangling, i like making complicated systems clearer.</p>
          <div className="service-list"><span>ai product prototypes</span><span>model training & evaluation</span><span>inference infrastructure</span><span>backend systems</span></div>
        </section>

        <section className={`contact-section section-anchor ${genieTarget === 'contact' ? 'genie-landing' : ''}`} id="contact">
          <div className="contact-copy"><span className="section-index">05 /</span><h2>let's make<br /><em>something useful.</em></h2><p>have a problem, an idea, or just a good question? my inbox is open.</p></div>
          <div className="contact-form-wrap">
            <form className="contact-form" name="contact" method="post" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleContactSubmit}>
              <input type="hidden" name="form-name" value="contact" />
              <p className="form-honeypot" aria-hidden="true"><label>don't fill this out <input name="bot-field" tabIndex="-1" autoComplete="off" /></label></p>
              <label htmlFor="contact-name">name <span>optional</span></label>
              <input id="contact-name" name="name" type="text" placeholder="your name" autoComplete="name" />
              <label htmlFor="contact-email">email <span>required</span></label>
              <input id="contact-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
              <label htmlFor="contact-message">message <span>required</span></label>
              <textarea id="contact-message" name="message" rows="5" placeholder="tell me a little about it..." required />
              <div className="form-footer">
                <button className="button button-dark" type="submit" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? 'sending...' : 'send message'} <ArrowUpRight /></button>
                <span className={`form-status ${formStatus}`} role="status">{formStatus === 'sent' ? 'thanks — i’ll get back to you soon.' : formStatus === 'error' ? 'something went wrong. try again.' : ''}</span>
              </div>
            </form>
            <a className="resume-link" href="/resume.pdf" download onClick={() => track('resume_downloaded')}>resume pdf <ArrowUpRight /></a>
          </div>
        </section>

        <footer className="footer"><span>made with curiosity and too much coffee.</span><span>© {new Date().getFullYear()} prasanna</span></footer>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
