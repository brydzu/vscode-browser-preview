import * as React from 'react';
import './viewport.css';

import Loading from '../loading-bar/loading-bar';
import Resizable from 're-resizable';
import Screencast from '../screencast/screencast';
import ViewportInfo from '../viewport-info/viewport-info';

import * as _ from 'lodash';

class Viewport extends React.Component<any, any> {
  private viewportRef: React.RefObject<HTMLDivElement>;
  private debouncedResizeHandler: any;

  constructor(props: any) {
    super(props);
    this.viewportRef = React.createRef();

    this.state = {
      padding: 0,
      isFixedSize: false,
      isResizable: false
    };

    this.debouncedResizeHandler = _.debounce(this.handleViewportResize.bind(this), 50);
    this.handleInspectElement = this.handleInspectElement.bind(this);
    this.handleInspectHighlightRequested = this.handleInspectHighlightRequested.bind(this);
    this.handleScreencastInteraction = this.handleScreencastInteraction.bind(this);
    this.handleResizeStop = this.handleResizeStop.bind(this);
  }

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    return {
      isResizable: nextProps.isDeviceEmulationEnabled,
      padding: nextProps.padding
    };
  }

  public componentDidMount() {
    this.debouncedResizeHandler();
    window.addEventListener('resize', this.debouncedResizeHandler);
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResizeHandler);
  }

  public render() {
    let width = this.props.width;
    let height = this.props.height;
    let resizableEnableOptions = {
      top: false,
      right: false,
      bottom: false,
      left: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false
    };

    if (this.state.isResizable) {
      width = width - this.state.padding;
      height = height - this.state.padding;

      resizableEnableOptions = {
        top: true,
        topRight: true,
        topLeft: true,
        bottom: true,
        bottomRight: true,
        bottomLeft: true,
        left: true,
        right: true
      };
    }

    let renderer = (
      <Screencast
        height={height}
        width={width}
        frame={this.props.frame}
        highlightInfo={this.props.highlightInfo}
        isInspectEnabled={this.props.isInspectEnabled}
        onInspectElement={this.handleInspectElement}
        onInspectHighlightRequested={this.handleInspectHighlightRequested}
        onInteraction={this.handleScreencastInteraction}
      />
    );

    return (
      <div className={`viewport ` + (this.state.isResizable ? `viewport-resizable` : ``)} ref={this.viewportRef}>
        <Loading percent={this.props.loadingPercent} />
        <ViewportInfo height={height} width={width} />
        <Resizable
          size={{
            width: width,
            height: height
          }}
          onResizeStop={this.handleResizeStop}
          enable={resizableEnableOptions}
          handleClasses={{
            bottom: 'viewport-resizer resizer-bottom',
            bottomRight: 'viewport-resizer resizer-bottom-right',
            bottomLeft: 'viewport-resizer resizer-bottom-left',
            left: 'viewport-resizer resizer-left',
            right: 'viewport-resizer resizer-right',
            top: 'viewport-resizer resizer-top',
            topRight: 'viewport-resizer resizer-top-right',
            topLeft: 'viewport-resizer resizer-top-left'
          }}
        >
          {renderer}
        </Resizable>
      </div>
    );
  }

  public resetViewportSize() {
    this.setState(
      {
        isFixedSize: false
      },
      () => {
        this.calculateViewportSize();
      }
    );
  }

  private calculateViewportSize() {
    if (this.viewportRef.current) {
      const dim = this.viewportRef.current.getBoundingClientRect();

      let currentWidth = this.props.width;
      let currentHeight = this.props.height;

      let viewportWidth = dim.width;
      let viewportHeight = dim.height;

      let newViewportWidth = viewportWidth;
      let newViewportHeight = viewportHeight;

      if (this.state.isFixedSize) {
        newViewportHeight = currentHeight > viewportHeight ? viewportHeight : currentHeight;
        newViewportWidth = currentWidth > viewportWidth ? viewportWidth : currentWidth;
      }

      console.log('newViewportWidth', newViewportWidth);
      console.log('newViewportHeight', newViewportHeight);

      this.emitViewportChanges({
        width: newViewportWidth,
        height: newViewportHeight
      });
    }
  }

  private handleViewportResize() {
    this.calculateViewportSize();
  }

  private handleResizeStop(e: any, direction: any, ref: any, delta: any) {
    console.log('delta', delta);

    this.setState({
      isFixedSize: true
    });

    this.emitViewportChanges({
      width: this.props.width + delta.width,
      height: this.props.height + delta.height
    });
  }

  private handleInspectElement(params: object) {
    this.props.onViewportChanged('inspectElement', {
      params: params
    });
  }

  private handleInspectHighlightRequested(params: object) {
    this.props.onViewportChanged('inspectHighlightRequested', {
      params: params
    });
  }

  private handleScreencastInteraction(action: string, params: object) {
    this.props.onViewportChanged('interaction', {
      action: action,
      params: params
    });
  }

  private emitViewportChanges(newViewport: any) {
    this.props.onViewportChanged('size', {
      height: newViewport.height,
      width: newViewport.width
    });
  }
}

export default Viewport;
