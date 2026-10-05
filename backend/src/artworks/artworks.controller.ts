import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ArtworksService } from './artworks.service';
import { QueryArtworkDto } from './dto/query-artwork.dto';
import { ArtworkEntity } from './entities/artwork.entity';

@ApiTags('artworks')
@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get()
  @ApiOperation({
    summary: 'List artworks, optionally sorted by price and filtered by artist/type',
  })
  @ApiOkResponse({ type: ArtworkEntity, isArray: true })
  findAll(@Query() query: QueryArtworkDto): Promise<ArtworkEntity[]> {
    return this.artworksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single artwork by id' })
  @ApiParam({ name: 'id', example: 'cmuuyh1x00000rton7b580ubs' })
  @ApiOkResponse({ type: ArtworkEntity })
  findOne(@Param('id') id: string): Promise<ArtworkEntity> {
    return this.artworksService.findOne(id);
  }
}
