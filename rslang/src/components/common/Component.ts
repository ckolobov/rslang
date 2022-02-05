interface Component {
  render(): Promise<string>
  after_render(): Promise<void>
}

export default Component;